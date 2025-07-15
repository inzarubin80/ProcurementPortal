package http

import (
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

type LinkProviderHandler struct {
	store         *sessions.CookieStore
	providerConfs authinterface.MapProviderOauthConf
}

func NewLinkProviderHandler(store *sessions.CookieStore, providerConfs authinterface.MapProviderOauthConf) *LinkProviderHandler {
	return &LinkProviderHandler{store: store, providerConfs: providerConfs}
}

func (h *LinkProviderHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	userID, ok := ctx.Value(defenitions.UserIDKey).(model.UserID)
	if !ok {
		uhttp.SendErrorResponse(w, http.StatusUnauthorized, "not user ID")
		return
	}

	provider := r.URL.Query().Get("provider")
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
