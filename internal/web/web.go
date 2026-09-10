package web

import (
	"encoding/json"
	"errors"
	"html/template"
	"net/http"

	"volunteerhub/internal/service"
)

const page = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Volunteer Hub</title>
<style>
:root{color-scheme:light;--ink:#17221d;--muted:#66736b;--paper:#f3f0e8;--card:#fffdf8;--green:#1f6048;--lime:#c9df72;--line:#d8d4c8}*{box-sizing:border-box}body{margin:0;background:var(--paper);color:var(--ink);font:16px Georgia,serif}header{padding:28px 7vw 22px;border-bottom:1px solid var(--line);display:flex;justify-content:space-between;align-items:center}header strong{font-size:1.45rem;letter-spacing:.02em}header span{color:var(--muted);font:12px Arial,sans-serif;text-transform:uppercase;letter-spacing:.14em}main{max-width:1180px;margin:auto;padding:64px 7vw 90px}.hero{max-width:780px}.eyebrow{color:var(--green);font:12px Arial,sans-serif;font-weight:bold;letter-spacing:.18em;text-transform:uppercase}.hero h1{font-size:clamp(3rem,8vw,7rem);line-height:.9;margin:18px 0 25px;font-weight:normal}.hero p{font-size:1.25rem;line-height:1.5;color:var(--muted);max-width:620px}.grid{display:grid;grid-template-columns:1.2fr .8fr;gap:24px;margin-top:56px}.panel{background:var(--card);border:1px solid var(--line);padding:26px;box-shadow:8px 8px 0 rgba(31,96,72,.1)}h2{margin:0 0 20px;font-size:1.7rem;font-weight:normal}.event{padding:17px 0;border-top:1px solid var(--line)}.event:first-of-type{border-top:0;padding-top:0}.event h3{margin:0 0 7px;font-size:1.25rem}.meta{color:var(--muted);font:14px Arial,sans-serif;line-height:1.6}.badge{display:inline-block;background:var(--lime);padding:4px 8px;margin-top:9px;font:11px Arial,sans-serif;text-transform:uppercase;letter-spacing:.1em}.form{display:grid;gap:12px}label{font:12px Arial,sans-serif;color:var(--muted);text-transform:uppercase;letter-spacing:.08em}input,button{font:16px Arial,sans-serif;padding:12px;border:1px solid var(--line);border-radius:0}button{background:var(--green);color:white;border-color:var(--green);cursor:pointer;font-weight:bold}button:hover{background:#164936}.notice{margin-top:15px;min-height:22px;font:14px Arial,sans-serif}.error{color:#a33}.success{color:var(--green)}footer{padding:24px 7vw;border-top:1px solid var(--line);color:var(--muted);font:12px Arial,sans-serif}@media(max-width:760px){header{display:block}header span{display:block;margin-top:8px}.grid{grid-template-columns:1fr}main{padding-top:42px}}
</style>
</head>
<body>
<header><strong>Volunteer Hub</strong><span>Go-powered community service</span></header>
<main>
<section class="hero"><div class="eyebrow">Lyman NHS / service desk</div><h1>Show up for something that matters.</h1><p>Find upcoming volunteer and tutoring opportunities, then reserve your place with the simple Go service behind this page.</p></section>
<section class="grid"><div class="panel"><h2>Upcoming events</h2><div id="events">Loading events...</div></div><div class="panel"><h2>Join the hub</h2><form id="signup" class="form"><label>First name<input name="firstName" required></label><label>Last name<input name="lastName" required></label><label>Email<input name="email" type="email" required></label><label>Password<input name="password" type="password" minlength="8" required></label><button type="submit">Create member account</button></form><div id="notice" class="notice"></div><h2>Reserve a place</h2><form id="reserve" class="form"><label>Event name<input name="eventName" required></label><label>Member email<input name="email" type="email" required></label><button type="submit">Sign up for event</button></form><div id="reserveNotice" class="notice"></div><h2>Check hours</h2><form id="hours" class="form"><label>Member email<input name="email" type="email" required></label><button type="submit">View my hours</button></form><div id="hoursNotice" class="notice"></div></div></section>
</main><footer>Volunteer Hub is served by Go's standard library.</footer>
<script>
const events = document.querySelector('#events');
fetch('/api/events').then(r=>r.json()).then(items=>{events.innerHTML=items.length?items.map(e=>'<article class="event"><h3>'+escapeHtml(e.eventName)+'</h3><div class="meta">'+escapeHtml(e.date)+' - '+escapeHtml(e.startTime)+' to '+escapeHtml(e.endTime)+'<br>'+escapeHtml(e.location)+' - '+e.volunteers.length+'/'+e.volunteersNeeded+' places filled</div>'+(e.isTutoring?'<span class="badge">Tutoring</span>':'<span class="badge">Volunteer</span>')+'</article>').join(''):'<p class="meta">No events are scheduled yet.</p>'}).catch(()=>events.textContent='Unable to load events.');
document.querySelector('#signup').addEventListener('submit',async event=>{event.preventDefault();const notice=document.querySelector('#notice');const payload=Object.fromEntries(new FormData(event.target));const response=await fetch('/api/members',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});notice.textContent=response.ok?'Account created. An administrator must approve it before signup.':await response.text();notice.className='notice '+(response.ok?'success':'error');if(response.ok)event.target.reset();});
document.querySelector('#reserve').addEventListener('submit',async event=>{event.preventDefault();const notice=document.querySelector('#reserveNotice');const payload=Object.fromEntries(new FormData(event.target));const response=await fetch('/api/signups',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});notice.textContent=response.ok?'You are signed up for this event.':await response.text();notice.className='notice '+(response.ok?'success':'error');});
document.querySelector('#hours').addEventListener('submit',async event=>{event.preventDefault();const notice=document.querySelector('#hoursNotice');const email=new FormData(event.target).get('email');const response=await fetch('/api/hours?email='+encodeURIComponent(email));if(!response.ok){notice.textContent=await response.text();notice.className='notice error';return;}const summary=await response.json();notice.textContent=summary.name+': '+summary.volunteerHours+' volunteer hours, '+summary.tutoringHours+' tutoring hours';notice.className='notice success';});
function escapeHtml(value){return String(value).replace(/[&<>'"]/g,character=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;', '"':'&quot;'}[character]));}
</script></body></html>`

type Handler struct{ Service *service.VolunteerService }

func CORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		origin := r.Header.Get("Origin")
		if origin == "http://localhost:3000" || origin == "http://127.0.0.1:3000" {
			w.Header().Set("Access-Control-Allow-Origin", origin)
			w.Header().Set("Vary", "Origin")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		}
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}

type signupRequest struct {
	EventName string `json:"eventName"`
	Email     string `json:"email"`
}

type approvalRequest struct {
	AdminEmail    string `json:"adminEmail"`
	AdminPassword string `json:"adminPassword"`
	MemberEmail   string `json:"memberEmail"`
}

type authRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

func (h Handler) Home(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/" {
		http.NotFound(w, r)
		return
	}
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	template.Must(template.New("home").Parse(page)).Execute(w, nil)
}

func (h Handler) Events(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		writeJSON(w, h.Service.ListEvents())
	case http.MethodPost:
		var event service.Event
		if err := json.NewDecoder(r.Body).Decode(&event); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		created, err := h.Service.CreateEvent(event)
		if err != nil {
			status := http.StatusBadRequest
			if errors.Is(err, service.ErrEventExists) {
				status = http.StatusConflict
			}
			http.Error(w, err.Error(), status)
			return
		}
		writeJSONStatus(w, created, http.StatusCreated)
	default:
		methodNotAllowed(w)
	}
}

func (h Handler) Members(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodGet {
		writeJSON(w, h.Service.ListMembers())
		return
	}
	if r.Method != http.MethodPost {
		methodNotAllowed(w)
		return
	}
	var member service.Member
	if err := json.NewDecoder(r.Body).Decode(&member); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	created, err := h.Service.RegisterMember(member)
	if err != nil {
		http.Error(w, err.Error(), memberErrorStatus(err))
		return
	}
	writeJSONStatus(w, created, http.StatusCreated)
}

func (h Handler) Auth(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		methodNotAllowed(w)
		return
	}
	var request authRequest
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	if _, err := h.Service.ValidateCredentials(request.Email, request.Password); err != nil {
		http.Error(w, "invalid credentials", http.StatusUnauthorized)
		return
	}
	writeJSON(w, map[string]bool{"authenticated": true})
}

func (h Handler) AdminAuth(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		methodNotAllowed(w)
		return
	}
	var request authRequest
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	member, err := h.Service.ValidateCredentials(request.Email, request.Password)
	if err != nil || !member.IsAdmin {
		http.Error(w, "admin authorization required", http.StatusUnauthorized)
		return
	}
	writeJSON(w, map[string]bool{"authenticated": true})
}

func (h Handler) Signups(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		methodNotAllowed(w)
		return
	}

	var request signupRequest
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	if request.EventName == "" || request.Email == "" {
		http.Error(w, "eventName and email are required", http.StatusBadRequest)
		return
	}

	added, err := h.Service.AddVolunteer(request.EventName, request.Email)
	if err != nil {
		http.Error(w, err.Error(), signupErrorStatus(err))
		return
	}
	writeJSON(w, map[string]bool{"signedUp": added})
}

func (h Handler) Approvals(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		methodNotAllowed(w)
		return
	}

	var request approvalRequest
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	if request.AdminEmail == "" || request.AdminPassword == "" || request.MemberEmail == "" {
		http.Error(w, "adminEmail, adminPassword, and memberEmail are required", http.StatusBadRequest)
		return
	}

	if err := h.Service.ApproveMemberAsAdmin(request.AdminEmail, request.AdminPassword, request.MemberEmail); err != nil {
		status := http.StatusUnauthorized
		if errors.Is(err, service.ErrMemberNotFound) {
			status = http.StatusNotFound
		}
		http.Error(w, err.Error(), status)
		return
	}
	writeJSON(w, map[string]bool{"approved": true})
}

func (h Handler) Hours(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		methodNotAllowed(w)
		return
	}

	email := r.URL.Query().Get("email")
	if email == "" {
		http.Error(w, "email is required", http.StatusBadRequest)
		return
	}

	summary, err := h.Service.GetHoursSummary(email)
	if err != nil {
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}
	writeJSON(w, summary)
}

func (h Handler) Health(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		methodNotAllowed(w)
		return
	}
	writeJSON(w, map[string]string{"status": "ok", "service": "volunteerhub"})
}

func writeJSON(w http.ResponseWriter, value any) { writeJSONStatus(w, value, http.StatusOK) }
func writeJSONStatus(w http.ResponseWriter, value any, status int) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(value)
}
func methodNotAllowed(w http.ResponseWriter) {
	http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
}
func memberErrorStatus(err error) int {
	if errors.Is(err, service.ErrMemberExists) {
		return http.StatusConflict
	}
	return http.StatusBadRequest
}

func signupErrorStatus(err error) int {
	switch {
	case errors.Is(err, service.ErrMemberNotFound), errors.Is(err, service.ErrEventNotFound):
		return http.StatusNotFound
	case errors.Is(err, service.ErrAlreadySignedUp), errors.Is(err, service.ErrNotVerified), errors.Is(err, service.ErrEventFull):
		return http.StatusConflict
	default:
		return http.StatusBadRequest
	}
}
