package service

import (
	"errors"
	"fmt"
	"strings"
	"sync"
)

var (
	ErrInvalidEmail    = errors.New("invalid email")
	ErrInvalidPassword = errors.New("password must be at least 8 characters")
	ErrMemberExists    = errors.New("member already exists")
	ErrMemberNotFound  = errors.New("member not found")
	ErrEventNotFound   = errors.New("event not found")
	ErrAlreadySignedUp = errors.New("member already signed up for this event")
	ErrEventFull       = errors.New("event has no remaining volunteer places")
	ErrNotVerified     = errors.New("member must be verified before signing up")
	ErrInvalidField    = errors.New("required field is missing")
	ErrUnauthorized    = errors.New("admin authorization required")
	ErrEventExists     = errors.New("event already exists")
)

type Member struct {
	FirstName      string  `json:"firstName"`
	LastName       string  `json:"lastName"`
	Email          string  `json:"email"`
	Password       string  `json:"-"`
	Grade          int     `json:"grade"`
	IsAdmin        bool    `json:"isAdmin"`
	IsVerified     bool    `json:"isVerified"`
	VolunteerHours float64 `json:"volunteerHours"`
	TutoringHours  float64 `json:"tutoringHours"`
}

type Event struct {
	EventName        string   `json:"eventName"`
	Date             string   `json:"date"`
	Location         string   `json:"location"`
	StartTime        string   `json:"startTime"`
	EndTime          string   `json:"endTime"`
	VolunteersNeeded int      `json:"volunteersNeeded"`
	Volunteers       []string `json:"volunteers"`
	VolunteerEmails  []string `json:"-"`
	IsTutoring       bool     `json:"isTutoring"`
	TutorHost        string   `json:"tutorHost,omitempty"`
	Teachers         string   `json:"teachers,omitempty"`
}

type HoursSummary struct {
	Name           string  `json:"name"`
	VolunteerHours float64 `json:"volunteerHours"`
	TutoringHours  float64 `json:"tutoringHours"`
}

type VolunteerService struct {
	mu      sync.RWMutex
	members map[string]Member
	events  map[string]Event
}

func NewVolunteerService() *VolunteerService {
	return &VolunteerService{
		members: make(map[string]Member),
		events:  make(map[string]Event),
	}
}

func normalizeEmail(email string) string {
	return strings.ToLower(strings.TrimSpace(email))
}

func normalizeEventName(name string) string {
	return strings.TrimSpace(strings.ToLower(name))
}

func (m Member) FullName() string {
	return strings.TrimSpace(m.FirstName + " " + m.LastName)
}

func validateMember(member Member) error {
	if strings.TrimSpace(member.FirstName) == "" || strings.TrimSpace(member.LastName) == "" {
		return ErrInvalidField
	}
	if !strings.Contains(member.Email, "@") || strings.TrimSpace(member.Email) == "" {
		return ErrInvalidEmail
	}
	if len(strings.TrimSpace(member.Password)) < 8 {
		return ErrInvalidPassword
	}
	return nil
}

func (s *VolunteerService) RegisterMember(member Member) (Member, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	if err := validateMember(member); err != nil {
		return Member{}, err
	}

	email := normalizeEmail(member.Email)
	if _, exists := s.members[email]; exists {
		return Member{}, ErrMemberExists
	}

	member.Email = email
	member.Password = strings.TrimSpace(member.Password)
	member.IsVerified = false
	member.IsAdmin = false
	member.VolunteerHours = 0
	member.TutoringHours = 0

	s.members[email] = member
	return member, nil
}

func (s *VolunteerService) RegisterAdmin(member Member) (Member, error) {
	created, err := s.RegisterMember(member)
	if err != nil {
		return Member{}, err
	}

	s.mu.Lock()
	defer s.mu.Unlock()
	created.IsAdmin = true
	created.IsVerified = true
	s.members[created.Email] = created
	return created, nil
}

func (s *VolunteerService) ApproveMember(email string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	email = normalizeEmail(email)
	member, exists := s.members[email]
	if !exists {
		return ErrMemberNotFound
	}
	member.IsVerified = true
	s.members[email] = member
	return nil
}

func (s *VolunteerService) CreateEvent(event Event) (Event, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	if strings.TrimSpace(event.EventName) == "" || strings.TrimSpace(event.Date) == "" || strings.TrimSpace(event.Location) == "" {
		return Event{}, ErrInvalidField
	}
	if event.VolunteersNeeded < 0 {
		return Event{}, ErrInvalidField
	}
	event.Volunteers = make([]string, 0)
	event.VolunteerEmails = make([]string, 0)

	key := normalizeEventName(event.EventName)
	if _, exists := s.events[key]; exists {
		return Event{}, ErrEventExists
	}
	s.events[key] = event
	return event, nil
}

func (s *VolunteerService) GetEvent(eventName string) (Event, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	key := normalizeEventName(eventName)
	event, exists := s.events[key]
	if !exists {
		return Event{}, ErrEventNotFound
	}
	return event, nil
}

func (s *VolunteerService) AddVolunteer(eventName, email string) (bool, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	email = normalizeEmail(email)
	member, exists := s.members[email]
	if !exists {
		return false, ErrMemberNotFound
	}
	if !member.IsVerified {
		return false, ErrNotVerified
	}

	key := normalizeEventName(eventName)
	event, exists := s.events[key]
	if !exists {
		return false, ErrEventNotFound
	}
	for _, volunteerEmail := range event.VolunteerEmails {
		if volunteerEmail == email {
			return false, ErrAlreadySignedUp
		}
	}
	if event.VolunteersNeeded > 0 && len(event.Volunteers) >= event.VolunteersNeeded {
		return false, ErrEventFull
	}

	event.Volunteers = append(event.Volunteers, member.FullName())
	event.VolunteerEmails = append(event.VolunteerEmails, email)
	s.events[key] = event
	return true, nil
}

func (s *VolunteerService) RemoveVolunteer(eventName, email string) (bool, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	email = normalizeEmail(email)
	member, exists := s.members[email]
	if !exists {
		return false, ErrMemberNotFound
	}
	key := normalizeEventName(eventName)
	event, exists := s.events[key]
	if !exists {
		return false, ErrEventNotFound
	}

	updated := make([]string, 0, len(event.Volunteers))
	updatedEmails := make([]string, 0, len(event.VolunteerEmails))
	removed := false
	for index, volunteer := range event.Volunteers {
		volunteerEmail := ""
		if index < len(event.VolunteerEmails) {
			volunteerEmail = event.VolunteerEmails[index]
		}
		if volunteerEmail == email || (volunteerEmail == "" && strings.EqualFold(volunteer, member.FullName())) {
			removed = true
			continue
		}
		updated = append(updated, volunteer)
		if index < len(event.VolunteerEmails) {
			updatedEmails = append(updatedEmails, volunteerEmail)
		}
	}
	if !removed {
		return false, nil
	}

	event.Volunteers = updated
	event.VolunteerEmails = updatedEmails
	s.events[key] = event
	return true, nil
}

func (s *VolunteerService) GetHoursSummary(email string) (HoursSummary, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	email = normalizeEmail(email)
	member, exists := s.members[email]
	if !exists {
		return HoursSummary{}, ErrMemberNotFound
	}
	return HoursSummary{
		Name:           member.FullName(),
		VolunteerHours: member.VolunteerHours,
		TutoringHours:  member.TutoringHours,
	}, nil
}

func (s *VolunteerService) ListEvents() []Event {
	s.mu.RLock()
	defer s.mu.RUnlock()

	events := make([]Event, 0, len(s.events))
	for _, event := range s.events {
		events = append(events, event)
	}
	return events
}

func (s *VolunteerService) ListMembers() []Member {
	s.mu.RLock()
	defer s.mu.RUnlock()

	members := make([]Member, 0, len(s.members))
	for _, member := range s.members {
		members = append(members, member)
	}
	return members
}

func (s *VolunteerService) UpdateMemberHours(email string, volunteerHours, tutoringHours float64) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	email = normalizeEmail(email)
	member, exists := s.members[email]
	if !exists {
		return ErrMemberNotFound
	}
	member.VolunteerHours += volunteerHours
	member.TutoringHours += tutoringHours
	s.members[email] = member
	return nil
}

func (s *VolunteerService) ValidateCredentials(email, password string) (Member, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	email = normalizeEmail(email)
	member, exists := s.members[email]
	if !exists {
		return Member{}, ErrMemberNotFound
	}
	if member.Password != strings.TrimSpace(password) {
		return Member{}, fmt.Errorf("invalid credentials")
	}
	return member, nil
}

func (s *VolunteerService) ApproveMemberAsAdmin(adminEmail, adminPassword, memberEmail string) error {
	admin, err := s.ValidateCredentials(adminEmail, adminPassword)
	if err != nil || !admin.IsAdmin {
		return ErrUnauthorized
	}
	return s.ApproveMember(memberEmail)
}
