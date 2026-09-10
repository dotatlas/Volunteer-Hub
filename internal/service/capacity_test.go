package service

import "testing"

func TestSignupUsesEmailIdentityAndRespectsCapacity(t *testing.T) {
	svc := NewVolunteerService()
	members := []Member{
		{FirstName: "Sam", LastName: "Lee", Email: "sam.one@example.com", Password: "password1"},
		{FirstName: "Sam", LastName: "Lee", Email: "sam.two@example.com", Password: "password2"},
	}
	for _, member := range members {
		if _, err := svc.RegisterMember(member); err != nil {
			t.Fatalf("register member: %v", err)
		}
		if err := svc.ApproveMember(member.Email); err != nil {
			t.Fatalf("approve member: %v", err)
		}
	}

	if _, err := svc.CreateEvent(Event{
		EventName:        "One Place",
		Date:             "2026-09-07",
		Location:         "Library",
		VolunteersNeeded: 1,
	}); err != nil {
		t.Fatalf("create event: %v", err)
	}
	if ok, err := svc.AddVolunteer("One Place", members[0].Email); err != nil || !ok {
		t.Fatalf("first signup: %v (%v)", err, ok)
	}
	if _, err := svc.AddVolunteer("One Place", members[0].Email); err != ErrAlreadySignedUp {
		t.Fatalf("duplicate signup error = %v, want %v", err, ErrAlreadySignedUp)
	}
	if _, err := svc.AddVolunteer("One Place", members[1].Email); err != ErrEventFull {
		t.Fatalf("full event error = %v, want %v", err, ErrEventFull)
	}
}
