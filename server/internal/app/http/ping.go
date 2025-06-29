package http

import (
	"inzarubin80/MemCode/internal/app/uhttp"
	"net/http"
)

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
