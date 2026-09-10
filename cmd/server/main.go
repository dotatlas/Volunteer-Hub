package main

import (
	"log"
	"net/http"
	"os"
	"time"

	"volunteerhub/internal/service"
	"volunteerhub/internal/web"
)

func main() {
	svc := service.NewVolunteerService()

	adminEmail := os.Getenv("VOLUNTEERHUB_ADMIN_EMAIL")
	adminPassword := os.Getenv("VOLUNTEERHUB_ADMIN_PASSWORD")
	if adminEmail != "" && adminPassword != "" {
		if _, err := svc.RegisterAdmin(service.Member{
			FirstName: "Admin",
			LastName:  "User",
			Email:     adminEmail,
			Password:  adminPassword,
			Grade:     12,
		}); err != nil {
			log.Fatal(err)
		}
	} else {
		log.Println("admin approval disabled: set VOLUNTEERHUB_ADMIN_EMAIL and VOLUNTEERHUB_ADMIN_PASSWORD")
	}

	svc.CreateEvent(service.Event{
		EventName:        "Park Cleanup",
		Date:             time.Now().Add(24 * time.Hour).Format("2006-01-02"),
		Location:         "Lyman Park",
		StartTime:        "09:00",
		EndTime:          "11:00",
		VolunteersNeeded: 8,
		IsTutoring:       false,
	})

	handler := web.Handler{Service: svc}
	http.Handle("/", web.CORS(http.HandlerFunc(handler.Home)))
	http.Handle("/health", web.CORS(http.HandlerFunc(handler.Health)))
	http.Handle("/api/members", web.CORS(http.HandlerFunc(handler.Members)))
	http.Handle("/api/auth", web.CORS(http.HandlerFunc(handler.Auth)))
	http.Handle("/api/auth/admin", web.CORS(http.HandlerFunc(handler.AdminAuth)))
	http.Handle("/api/events", web.CORS(http.HandlerFunc(handler.Events)))
	http.Handle("/api/signups", web.CORS(http.HandlerFunc(handler.Signups)))
	http.Handle("/api/hours", web.CORS(http.HandlerFunc(handler.Hours)))
	http.Handle("/api/approvals", web.CORS(http.HandlerFunc(handler.Approvals)))

	log.Println("VolunteerHub Go server listening on :8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
