package http

import (
	"encoding/json"
	"inzarubin80/MemCode/internal/app/uhttp"
	"inzarubin80/MemCode/internal/model"
	"net/http"
)

type GetDifficultiesHandler struct {
	name string
}

type DifficultyResponse struct {
	Name  string `json:"name"`
	Value string `json:"value"`
}

func NewGetDifficultiesHandler(name string) *GetDifficultiesHandler {
	return &GetDifficultiesHandler{
		name: name,
	}
}

func (h *GetDifficultiesHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	supported := model.GetSupportedDifficulties()
	difficulties := make([]DifficultyResponse, len(supported))
	for i, diff := range supported {
		difficulties[i] = DifficultyResponse{
			Name:  getDifficultyDisplayName(diff),
			Value: string(diff),
		}
	}

	jsonData, err := json.Marshal(difficulties)
	if err != nil {
		uhttp.SendErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}

	uhttp.SendSuccessfulResponse(w, jsonData)
}

func getDifficultyDisplayName(diff model.Difficulty) string {
	switch diff {
	case "beginner":
		return "Новичок"
	case "intermediate":
		return "Средний"
	case "advanced":
		return "Продвинутый"
	case "easy":
		return "Легко"
	case "medium":
		return "Средне"
	case "hard":
		return "Сложно"
	default:
		return string(diff)
	}
}
