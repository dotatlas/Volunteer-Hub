package web

import (
	"bytes"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"volunteerhub/internal/service"
)

func TestHomeAndEventsEndpoints(t *testing.T) {
	svc := service.NewVolunteerService()
	_, err := svc.CreateEvent(service.Event{
		EventName:        "Food Drive",
		Date:             "2026-09-06",
		Location:         "Community Center",
		VolunteersNeeded: 4,
	})
	if err != nil {
		t.Fatalf("create event: %v", err)
	}

	handler := Handler{Service: svc}
	root := httptest.NewRecorder()
	handler.Home(root, httptest.NewRequest(http.MethodGet, "/", nil))
	if root.Code != http.StatusOK || !strings.Contains(root.Body.String(), "Volunteer Hub") {
		t.Fatalf("home response: status=%d body=%q", root.Code, root.Body.String())
	}

	events := httptest.NewRecorder()
	handler.Events(events, httptest.NewRequest(http.MethodGet, "/api/events", nil))
	if events.Code != http.StatusOK || !strings.Contains(events.Body.String(), "Food Drive") {
		t.Fatalf("events response: status=%d body=%q", events.Code, events.Body.String())
	}

	created := httptest.NewRecorder()
	createRequest := httptest.NewRequest(http.MethodPost, "/api/events", strings.NewReader(`{"eventName":"River Walk","date":"2026-09-08","location":"River Trail","volunteersNeeded":3}`))
	createRequest.Header.Set("Content-Type", "application/json")
	handler.Events(created, createRequest)
	if created.Code != http.StatusCreated || !strings.Contains(created.Body.String(), "River Walk") {
		t.Fatalf("create event response: status=%d body=%q", created.Code, created.Body.String())
	}
}

func TestSignupAndHoursEndpoints(t *testing.T) {
	svc := service.NewVolunteerService()
	member, err := svc.RegisterMember(service.Member{
		FirstName: "Ada",
		LastName:  "Lovelace",
		Email:     "ada@example.com",
		Password:  "password123",
	})
	if err != nil {
		t.Fatalf("register member: %v", err)
	}
	if err := svc.ApproveMember(member.Email); err != nil {
		t.Fatalf("approve member: %v", err)
	}
	if _, err := svc.CreateEvent(service.Event{
		EventName:        "Library Shift",
		Date:             "2026-09-07",
		Location:         "Library",
		VolunteersNeeded: 2,
	}); err != nil {
		t.Fatalf("create event: %v", err)
	}

	handler := Handler{Service: svc}
	request := httptest.NewRequest(http.MethodPost, "/api/signups", bytes.NewBufferString(`{"eventName":"Library Shift","email":"ada@example.com"}`))
	request.Header.Set("Content-Type", "application/json")
	signup := httptest.NewRecorder()
	handler.Signups(signup, request)
	if signup.Code != http.StatusOK || !strings.Contains(signup.Body.String(), `"signedUp":true`) {
		t.Fatalf("signup response: status=%d body=%q", signup.Code, signup.Body.String())
	}

	hours := httptest.NewRecorder()
	handler.Hours(hours, httptest.NewRequest(http.MethodGet, "/api/hours?email=ada@example.com", nil))
	if hours.Code != http.StatusOK || !strings.Contains(hours.Body.String(), "Ada Lovelace") {
		t.Fatalf("hours response: status=%d body=%q", hours.Code, hours.Body.String())
	}
}

func TestCORSForNextDevelopmentServer(t *testing.T) {
	handler := CORS(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusOK)
	}))

	request := httptest.NewRequest(http.MethodOptions, "/api/events", nil)
	request.Header.Set("Origin", "http://localhost:3000")
	response := httptest.NewRecorder()
	handler.ServeHTTP(response, request)
	if response.Code != http.StatusNoContent || response.Header().Get("Access-Control-Allow-Origin") != "http://localhost:3000" {
		t.Fatalf("CORS response: status=%d headers=%v", response.Code, response.Header())
	}
}
