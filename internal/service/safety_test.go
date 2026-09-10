package service

import "testing"

func TestCreateEventRejectsDuplicateNames(t *testing.T) {
	svc := NewVolunteerService()
	event := Event{EventName: "Recurring Shift", Date: "2026-09-08", Location: "Center", Volunteers: []string{"Injected Member"}, VolunteersNeeded: -1}
	if _, err := svc.CreateEvent(event); err != ErrInvalidField {
		t.Fatalf("negative capacity error = %v, want %v", err, ErrInvalidField)
	}
	event.VolunteersNeeded = 1
	if _, err := svc.CreateEvent(event); err != nil {
		t.Fatalf("create event: %v", err)
	}
	created, err := svc.GetEvent(event.EventName)
	if err != nil {
		t.Fatalf("get event: %v", err)
	}
	if len(created.Volunteers) != 0 {
		t.Fatalf("created event retained injected volunteers: %v", created.Volunteers)
	}
	if _, err := svc.CreateEvent(event); err != ErrEventExists {
		t.Fatalf("duplicate event error = %v, want %v", err, ErrEventExists)
	}
}

func TestApproveMemberAsAdminRequiresAdminCredentials(t *testing.T) {
	svc := NewVolunteerService()
	if _, err := svc.RegisterMember(Member{
		FirstName: "Member",
		LastName:  "One",
		Email:     "member@example.com",
		Password:  "memberpass",
	}); err != nil {
		t.Fatalf("register member: %v", err)
	}
	if _, err := svc.RegisterAdmin(Member{
		FirstName: "Admin",
		LastName:  "One",
		Email:     "admin@example.com",
		Password:  "adminpass",
	}); err != nil {
		t.Fatalf("register admin: %v", err)
	}
	if err := svc.ApproveMemberAsAdmin("admin@example.com", "adminpass", "member@example.com"); err != nil {
		t.Fatalf("approve member as admin: %v", err)
	}
}
