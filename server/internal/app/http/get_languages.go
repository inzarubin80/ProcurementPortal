package http

import (
	"encoding/json"
	"inzarubin80/MemCode/internal/app/uhttp"
	"inzarubin80/MemCode/internal/model"
	"net/http"
)

type GetLanguagesHandler struct {
	name string
}

func NewGetLanguagesHandler(name string) *GetLanguagesHandler {
	return &GetLanguagesHandler{
		name: name,
	}
}

func (h *GetLanguagesHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	languages := model.GetSupportedLanguages()

	jsonData, err := json.Marshal(languages)
	if err != nil {
		uhttp.SendErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}

	uhttp.SendSuccessfulResponse(w, jsonData)
}
