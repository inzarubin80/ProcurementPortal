package http

import (
	"context"
	"fmt"
	"inzarubin80/MemCode/internal/app/defenitions"
	"inzarubin80/MemCode/internal/app/uhttp"
	"inzarubin80/MemCode/internal/model"
	"net/http"

	authinterface "inzarubin80/MemCode/internal/app/authinterface"

	"github.com/gorilla/sessions"
)

// LinkProviderHandler godoc
// @Summary      Привязать провайдера к профилю
// @Description  Стартует OAuth flow для привязки провайдера к текущему пользователю
// @Tags         user
// @Accept       json
// @Produce      json
// @Param        provider path string true "Провайдер (google, yandex, ... )"
// @Success      302 {string} string "Redirect to provider auth"
// @Failure      400 {object} uhttp.ErrorResponse
// @Router       /api/user/providers/link/{provider} [get]

type LinkProviderService interface {
	AddUserAuthProviders(ctx context.Context, userProfile *model.UserProfileFromProvider, userID model.UserID) (*model.UserAuthProviders, error)
}

type LinkProviderHandler struct {
	store         *sessions.CookieStore
	providerConfs authinterface.MapProviderOauthConf
	service       LinkProviderService
}

func NewLinkProviderHandler(store *sessions.CookieStore, providerConfs authinterface.MapProviderOauthConf, service LinkProviderService) *LinkProviderHandler {
	return &LinkProviderHandler{store: store, providerConfs: providerConfs, service: service}
}

// LinkProviderCallbackHandler — завершение привязки провайдера
func (h *LinkProviderHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	userID, ok := ctx.Value(defenitions.UserIDKey).(model.UserID)
	if !ok {
		uhttp.SendErrorResponse(w, http.StatusUnauthorized, "not user ID")
		return
	}

	code := r.URL.Query().Get("code")
	provider := r.URL.Query().Get("provider")

	if code != "" && provider != "" {
		// Это callback после OAuth — завершаем привязку
		conf, ok := h.providerConfs[provider]
		if !ok {
			uhttp.SendErrorResponse(w, http.StatusBadRequest, "unknown provider")
			return
		}
		// Получаем user info у провайдера по коду
		providerUserData := conf.ProviderUserData
		if providerUserData == nil {
			uhttp.SendErrorResponse(w, http.StatusInternalServerError, "provider user data not configured")
			return
		}
		userProfile, err := providerUserData.GetUserData(ctx, code)
		if err != nil {
			uhttp.SendErrorResponse(w, http.StatusInternalServerError, "failed to get user data from provider: "+err.Error())
			return
		}
		// Привязываем провайдера к текущему пользователю
		_, err = h.addUserAuthProvider(ctx, userProfile, userID)
		if err != nil {
			uhttp.SendErrorResponse(w, http.StatusInternalServerError, "failed to link provider: "+err.Error())
			return
		}
		uhttp.SendSuccessfulResponse(w, []byte(`{"result":"ok"}`))
		return
	}

	// ... существующий код редиректа на OAuth ...
	provider = r.URL.Query().Get("provider")
	if provider == "" {
		uhttp.SendErrorResponse(w, http.StatusBadRequest, "provider required")
		return
	}

	conf, ok := h.providerConfs[provider]
	if !ok {
		uhttp.SendErrorResponse(w, http.StatusBadRequest, "unknown provider")
		return
	}

	// Генерируем state с userID и типом действия link
	state := fmt.Sprintf("link_%d_%d", userID, model.UserID(userID)) // Можно добавить csrf/random

	authURL := conf.Oauth2Config.AuthCodeURL(state /*opts*/)

	http.Redirect(w, r, authURL, http.StatusFound)
}

// addUserAuthProvider — вспомогательная функция для привязки провайдера к пользователю
func (h *LinkProviderHandler) addUserAuthProvider(ctx context.Context, userProfile *model.UserProfileFromProvider, userID model.UserID) (*model.UserAuthProviders, error) {
	return h.service.AddUserAuthProviders(ctx, userProfile, userID)
}
