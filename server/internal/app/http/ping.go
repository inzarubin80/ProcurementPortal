package http

import (
	"inzarubin80/MemCode/internal/app/uhttp"
	"net/http"
)

// Ping godoc
// @Summary      Проверка доступности
// @Description  Проверяет, что сервер работает
// @Tags         health
// @Accept       json
// @Produce      json
// @Success      200      {string}  string "pong"
// @Router       /ping [get]

type (
	PingHandler struct {
		name string
	}
)

func NewPingHandlerHandler(name string) *PingHandler {
	return &PingHandler{
		name: name,
	}
}

func (h *PingHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	uhttp.SendSuccessfulResponse(w, []byte("{}"))

}
