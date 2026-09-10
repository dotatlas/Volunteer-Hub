package service

import (
	"testing"
	"time"
)

func TestVolunteerServiceLifecycle(t *testing.T) {
	svc := NewVolunteerService()

	member, err := svc.RegisterMember(Member{
		FirstName: "Alice",
		LastName:  "Johnson",
		Email:     "alice@example.com",
		Password:  "secretpass",
	})
	if err != nil {
		t.Fatalf("register member: %v", err)
	}
	if member.IsVerified {
		t.Fatal("new members should start unverified until admin approval")
	}
	if err := svc.ApproveMember(member.Email); err != nil {
		t.Fatalf("approve member: %v", err)
	}

	evt, err := svc.CreateEvent(Event{
		EventName:        "Park Cleanup",
		Date:             time.Now().Add(24 * time.Hour).Format("2006-01-02"),
		Location:         "Lyman Park",
		StartTime:        "09:00",
		EndTime:          "11:00",
		VolunteersNeeded: 10,
		IsTutoring:       false,
		TutorHost:        "",
		Teachers:         "",
	})
	if err != nil {
		t.Fatalf("create event: %v", err)
	}

	ok, err := svc.AddVolunteer(evt.EventName, "alice@example.com")
	if err != nil || !ok {
		t.Fatalf("add volunteer: %v (%v)", err, ok)
	}

	hours, err := svc.GetHoursSummary("alice@example.com")
	if err != nil {
		t.Fatalf("get hours summary: %v", err)
	}
	if hours.VolunteerHours < 0 {
		t.Fatal("volunteer hours should be non-negative")
	}
}
