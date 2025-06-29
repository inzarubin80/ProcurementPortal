package service

import (
	"context"

	"inzarubin80/MemCode/internal/model"
)

func (s *PokerService) SetUserName(ctx context.Context, userID model.UserID, name string) error {

	return s.repository.SetUserName(ctx, userID, name)

}

func (s *PokerService) GetUser(ctx context.Context, userID model.UserID) (*model.User, error) {

	user, err := s.repository.GetUser(ctx, userID)

	if err != nil {
		return nil, err
	}

	if user.EvaluationStrategy == "" {
		user.EvaluationStrategy = "average"
	}

	if user.MaximumScore == 0 {
		user.MaximumScore = 55
	}

	return user, err

}
