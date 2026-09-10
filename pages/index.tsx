// Imports
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import Script from "next/script";
import { use, useEffect, useRef, useState } from "react";
import {
	eventProps,
	getEvents,
	addEvent,
	addEventVolunteers,
	removeEventVolunteers,
	checkMemberHours,
	getMessagesArray,
	newMessage,
	newHoursRequest,
} from "../goApi";
import { useEffectOnce } from "usehooks-ts";
import { InstagramEmbed } from "react-social-media-embed";
import * as EmailValidator from "email-validator";
import { useAnimation, motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import axios from "axios";

// CSS imports
import styles from "../styles/pages/Home.module.css";

// Component imports
import ReactTypingEffect from "react-typing-effect";
import PageTitle from "../components/parts/PageTitle";
import Table from "../components/parts/Table";
import SecLayout from "../components/_seclayout";

// Page
export default function Home() {
	const getEventsAwait = async () => {
		return await getEvents();
	};

	const [events, setEvents] = useState<Array<eventProps>>([]);
	const [showSignUpModal, setShowSignUpModal] = useState(false);
	const [showLeaveEventModal, setShowLeaveEventModal] = useState(false);
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [eventInput, setEventInput] = useState("");

	useEffectOnce(() => {
		getEventsAwait().then((e) => {
			setEvents(e as Array<eventProps>);
			setEventInput(
				e
					.filter((thing) => thing.isTutoring == false)
					.filter(
						(thing) =>
							new Date(
								parseInt(thing.date.split("-")[0]),
								parseInt(thing.date.split("-")[1]) - 1,
								parseInt(thing.date.split("-")[2])
							).getTime() >=
							new Date().getTime() - 86400000
					)[0].eventName
			);
		});
		console.log(events);
	});

	const displayModal = async () => {
		setShowSignUpModal(!showSignUpModal);
	};

	const displayLeaveEventModal = async () => {
		setShowLeaveEventModal(!showLeaveEventModal);
	};

	const addVolunteerDb = async () => {
		if (
			email === "" ||
			password === "" ||
			email === undefined ||
			password === undefined ||
			eventInput === undefined
		) {
			alert("Please fill out all fields");
		} else if (!EmailValidator.validate(email)) {
			alert("Please enter a valid email");
		} else if (password.length < 8) {
			alert("Password must be at least 8 characters");
		} else {
			console.log(eventInput);
			addEventVolunteers(eventInput, email, password).then((e) => {
				if (e == true) {
					alert(`Successfully signed up for event "${eventInput}"`);
					setShowSignUpModal(!showSignUpModal);
				} else {
					console.log(e);
				}
			});
		}
	};

	const removeVolunteerDb = async () => {
		if (email === "" || email === undefined || eventInput === undefined) {
			alert("Please fill out all fields");
		} else if (!EmailValidator.validate(email)) {
			alert("Please enter a valid email");
		} else {
			removeEventVolunteers(eventInput, email, password).then((e) => {
				if (e == true) {
					alert(`Successfully left event "${eventInput}"`);
					setShowLeaveEventModal(!showLeaveEventModal);
				} else {
					console.log(e);
				}
			});
		}
	};

	const [showHourCheckModal, setShowHourCheckModal] = useState(false);
	const [hourCheckEmail, setHourCheckEmail] = useState("");
	const [hourCheckPassword, setHourCheckPassword] = useState("");

	const displayHourCheckModal = async () => {
		setShowHourCheckModal(!showHourCheckModal);
	};

	const checkHours = async () => {
		if (hourCheckEmail === "" || hourCheckPassword === "") {
			alert("Please fill out all fields");
		} else if (!EmailValidator.validate(hourCheckEmail)) {
			alert("Please enter a valid email");
		} else {
			checkMemberHours(hourCheckEmail, hourCheckPassword).then((e) => {
				alert(
					"Hours for " +
						e[2] +
						"\nVolunteer hours: " +
						e[0] +
						"\n" +
						"Tutoring hours: " +
						e[1]
				);
			});
		}
	};

	const isMobile = () => {
		let check = false;
		(function (a) {
			if (
				/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(
					a
				) ||
				/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
					a.substr(0, 4)
				)
			)
				check = true;
		})(navigator.userAgent || navigator.vendor);
		return check;
	};

	const [signUpModalDesicion, setSignUpModalDesicion] =
		useState<string>("Volunteering");
	const [leaveEventModalDesicion, setLeaveEventModalDesicion] =
		useState<string>("Volunteering");

	const [showOldTutoringEvents, setShowOldTutoringEvents] =
		useState<boolean>(false);

	const [displayMessageModal, setDisplayMessageModal] =
		useState<boolean>(false);
	const [message, setMessage] = useState<string>("");
	const [messageEmail, setMessageEmail] = useState<string>("");
	const [messagePassword, setMessagePassword] = useState<string>("");

	const [displayReqHoursModal, setDisplayReqHoursModal] =
		useState<boolean>(false);
	const [reqHoursEmail, setReqHoursEmail] = useState<string>("");
	const [reqHoursPassword, setReqHoursPassword] = useState<string>("");
	const [reqHoursEventName, setReqHoursEventName] = useState<string>("");
	const [reqHoursArriveTime, setReqHoursArriveTime] = useState<string>("");
	const [reqHoursLeaveTime, setReqHoursLeaveTime] = useState<string>("");
	const [reqHoursVolunteerHours, setReqHoursVolunteerHours] =
		useState<number>(0);
	const [reqHoursTutorHours, setReqHoursTutorHours] = useState<number>(0);
	const [reqHoursIsTutoring, setReqHoursIsTutoring] = useState<boolean>(false);

	const [showFormContent, setShowFormContent] = useState<boolean>(false);

	return (
		<SecLayout>
			{/* Meta tags */}
			<Head>
				<title>Lyman NHS</title>
				<link rel="canonical" href="https://lymannhs.netlify.app/" />
			</Head>

			{/* ! Main homepage content */}
			<main>
				<PageTitle title="Lyman NHS">
					<p id={`${styles.motto}`}>
						<ReactTypingEffect
							text={["Character", "Scholarship", "Leadership", "Service"]}
							eraseSpeed={70}
							typingDelay={1000}
							speed={180}
							eraseDelay={2000}
							cursor="_"
						/>
					</p>
				</PageTitle>
				<div id={`${styles.notTitle}`}>
					<section id={`${styles.AboutUs}`} className="container-lg">
						<h1 className="mb-0">About</h1>
{/* 						<p className="mt-0 container">
							Lyman NHS
						</p>
						<hr></hr> */}
						<p>Members are required to have...</p>
						<div
							className="row align-items-center justify-content-center container-md px-md-5"
							id={`${styles.requirmentsRow}`}
						>
							<div className="col-md-6 col-12">
								<p className="hoverUnderlineAnim">20 hours of volunteering</p>
							</div>
							<div className="col-md-6 col-12">
								<p className="hoverUnderlineAnim">5 hours of tutoring</p>
							</div>
						</div>
						<button
							className="LoadButton-pushable mt-3"
							onClick={(a) => displayHourCheckModal()}
						>
							<span className="LoadButton-shadow"></span>
							<span className="LoadButton-edge"></span>
							<span className="LoadButton-front text">
								Check your hours here
							</span>
						</button>

						{showHourCheckModal ? (
							<div id={`${styles.signUpModal}`}>
								<div id={`${styles.signUpModalContent}`}>
									<Image
										src={"/img/close.svg"}
										width={30}
										height={30}
										onClick={() => setShowHourCheckModal(!showHourCheckModal)}
										id={`${styles.closeModal}`}
										alt="Close modal"
									/>
									<h1>Check your hours</h1>
									<p className="mb-2">
										Enter email & password for member verification
									</p>
									<input
										type="email"
										placeholder="Email"
										value={hourCheckEmail}
										onChange={(v) => setHourCheckEmail(v.target.value)}
									/>
									<input
										type="password"
										placeholder="Password"
										value={hourCheckPassword}
										onChange={(v) => setHourCheckPassword(v.target.value)}
									/>
									<button
										className="LoadButton-pushable my-2"
										onClick={() => checkHours()}
									>
										<span className="LoadButton-shadow"></span>
										<span className="LoadButton-edge"></span>
										<span className="LoadButton-front text">Submit</span>
									</button>
								</div>
							</div>
						) : (
							<></>
						)}

						<hr></hr>
						<div className="row align-items-center justify-content-center container-md px-md-5">
							{/* 							<div className="col-md-6 col-12">
								<p className="mb-md-0 mb-2">
									Unable to attend a meeting or have any other problems? Send a
									message below
								</p>
								<button
									className="LoadButton-pushable mt-md-3 mt-1 mb-2"
									onClick={(a) => setDisplayMessageModal(!displayMessageModal)}
								>
									<span className="LoadButton-shadow"></span>
									<span className="LoadButton-edge"></span>
									<span className="LoadButton-front text">Send a message</span>
								</button>
								{displayMessageModal ? (
									<div id={`${styles.signUpModal}`}>
										<div id={`${styles.signUpModalContent}`}>
											<Image
												src={"/img/close.svg"}
												width={30}
												height={30}
												onClick={() =>
													setDisplayMessageModal(!displayMessageModal)
												}
												id={`${styles.closeModal}`}
												alt="Close modal"
											/>
											<h1>Send a message</h1>
											<p className="mb-2">
												Enter email & password for member verification
											</p>
											<p>
												Only one message per member can be stored, otherwise a
												new message will replace their original
											</p>
											<input
												type="email"
												placeholder="Email"
												value={messageEmail}
												onChange={(v) => setMessageEmail(v.target.value)}
											/>
											<input
												type="password"
												placeholder="Password"
												value={messagePassword}
												onChange={(v) => setMessagePassword(v.target.value)}
											/>
											<input
												type="text"
												placeholder="Message"
												value={message}
												onChange={(v) => setMessage(v.target.value)}
											/>

											<button
												className="LoadButton-pushable my-2"
												onClick={async () => {
													await newMessage(
														messageEmail,
														messagePassword,
														message
													);
													alert("Message sent!");
												}}
											>
												<span className="LoadButton-shadow"></span>
												<span className="LoadButton-edge"></span>
												<span className="LoadButton-front text">Submit</span>
											</button>
										</div>
									</div>
								) : (
									<></>
								)}
							</div> */}
							<div className="col-md-6 col-12">
								<p className="mb-md-0 mb-2">
									Just attended an event? Click the button to request hours
								</p>
								<button
									className="LoadButton-pushable mt-md-3 mt-1"
									onClick={(a) =>
										setDisplayReqHoursModal(!displayReqHoursModal)
									}
								>
									<span className="LoadButton-shadow"></span>
									<span className="LoadButton-edge"></span>
									<span className="LoadButton-front text">Request hours</span>
								</button>
								{displayReqHoursModal ? (
									<div id={`${styles.signUpModal}`}>
										<div id={`${styles.signUpModalContent}`}>
											<Image
												src={"/img/close.svg"}
												width={30}
												height={30}
												onClick={() =>
													setDisplayReqHoursModal(!displayReqHoursModal)
												}
												id={`${styles.closeModal}`}
												alt="Close modal"
											/>
											<h1>Request Hours</h1>
											<p className="mb-2">
												Enter email & password for member verification
											</p>
											<p className="mb-2">
												Only one request per event can be stored, otherwise it
												will replace the original
											</p>
											<div className="d-flex justify-content-center w-100	 flex-row mb-2">
												<p className="text-nowrap me-2">
													Is this a tutoring event?
												</p>
												<input
													type="checkbox"
													onChange={(v) => {
														if (!reqHoursIsTutoring) {
															setReqHoursVolunteerHours(0);
														} else if (reqHoursIsTutoring) {
															setReqHoursTutorHours(0);
														}
														setReqHoursIsTutoring(v.target.checked);
													}}
													className={styles.eventInput}
												></input>
											</div>

											<input
												type="email"
												placeholder="Email"
												value={reqHoursEmail}
												onChange={(v) => setReqHoursEmail(v.target.value)}
											/>
											<input
												type="password"
												placeholder="Password"
												value={reqHoursPassword}
												onChange={(v) => setReqHoursPassword(v.target.value)}
											/>
											<input
												type="text"
												placeholder="Event Name"
												value={reqHoursEventName}
												onChange={(v) => setReqHoursEventName(v.target.value)}
											/>
											<input
												type="text"
												placeholder="Arrival Time"
												value={reqHoursArriveTime}
												onChange={(v) => setReqHoursArriveTime(v.target.value)}
											/>
											<input
												type="text"
												placeholder="Departure Time"
												value={reqHoursLeaveTime}
												onChange={(v) => setReqHoursLeaveTime(v.target.value)}
											/>
											<p className="mb-2">Total hours attended</p>
											{!reqHoursIsTutoring ? (
												<input
													type="number"
													placeholder="Total hours volunteered"
													value={reqHoursVolunteerHours}
													onChange={(v) =>
														setReqHoursVolunteerHours(
															v.target.value as unknown as number
														)
													}
												/>
											) : (
												<input
													type="number"
													placeholder="Total hours tutored"
													value={reqHoursTutorHours}
													onChange={(v) =>
														setReqHoursTutorHours(
															v.target.value as unknown as number
														)
													}
												/>
											)}
											<button
												className="LoadButton-pushable my-2"
												onClick={async () => {
													await newHoursRequest({
														email: reqHoursEmail,
														password: reqHoursPassword,
														eventName: reqHoursEventName,
														arriveTime: reqHoursArriveTime,
														leaveTime: reqHoursLeaveTime,
														addVolunteerHours: reqHoursVolunteerHours,
														addTutoringHours: reqHoursTutorHours,
													});
													alert("Request sent!");
												}}
											>
												<span className="LoadButton-shadow"></span>
												<span className="LoadButton-edge"></span>
												<span className="LoadButton-front text">Submit</span>
											</button>
										</div>
									</div>
								) : (
									<></>
								)}
							</div>
						</div>
					</section>
					<section id={`${styles.UpcomingEvents}`} className="container-lg">
						<h1 className="mb-0">Upcoming Events</h1>
						<>
							<div className="d-flex flex-row align-items-center justify-content-center">
								<button
									className="ApproveButton-pushable mb-3 mt-3 me-3"
									onClick={(a) => {
										displayModal();
										setShowFormContent(false);
									}}
								>
									<span className="ApproveButton-shadow"></span>
									<span className="ApproveButton-edge"></span>
									<span className="ApproveButton-front text">
										Sign up for event
									</span>
								</button>
								<button
									className="DenyButton-pushable mb-3 mt-3"
									onClick={(a) => displayLeaveEventModal()}
								>
									<span className="DenyButton-shadow"></span>
									<span className="DenyButton-edge"></span>
									<span className="DenyButton-front text">Leave event</span>
								</button>
							</div>
							{showSignUpModal ? (
								<div id={`${styles.signUpModal}`}>
									<div id={`${styles.signUpModalContent}`}>
										<Image
											src={"/img/close.svg"}
											width={30}
											height={30}
											onClick={() => setShowSignUpModal(!showSignUpModal)}
											id={`${styles.closeModal}`}
											alt="Close modal"
										/>
										<h1>Sign Up</h1>
										{!showFormContent ? (
											<>
												<p>
													<a
														href="https://docs.google.com/forms/d/e/1FAIpQLSdUN1kvl_CVSYNKcQy5ZVe_qpjw2wZYg_eSsHzTjl02uk8DTQ/viewform?embedded=true"
														className="hoverUnderlineAnim"
													>
														This
													</a>{" "}
													must be filled out for <b>every</b> event
												</p>
												<iframe
													src="https://docs.google.com/forms/d/e/1FAIpQLSdUN1kvl_CVSYNKcQy5ZVe_qpjw2wZYg_eSsHzTjl02uk8DTQ/viewform?embedded=true"
													// width="auto"
													height="400"
													className="mt-2"
													frameBorder="0"
													marginHeight={0}
													marginWidth={0}
												/>
												<button
													className="LoadButton-pushable mb-2 mt-3"
													onClick={() => setShowFormContent(true)}
												>
													<span className="LoadButton-shadow"></span>
													<span className="LoadButton-edge"></span>
													<span className="LoadButton-front text">Next</span>
												</button>
											</>
										) : (
											<>
												<p className="mb-2">
													Enter email & password for member verification
												</p>
												<input
													type="email"
													placeholder="Email"
													value={email}
													onChange={(v) => setEmail(v.target.value)}
												/>
												<input
													type="password"
													placeholder="Password"
													value={password}
													onChange={(v) => setPassword(v.target.value)}
												/>
												<p className="mb-2">Volunteering or tutoring?</p>
												<select
													value={signUpModalDesicion}
													onChange={(v) => {
														if (v.target.value.length > 0) {
															setSignUpModalDesicion(v.target.value);
														} else {
															setSignUpModalDesicion("Volunteering");
														}
													}}
												>
													<option>Volunteering</option>
													<option>Tutoring</option>
												</select>
												<p className="mb-2">Select event to sign up for</p>
												<select
													value={eventInput}
													onChange={(v) => {
														if (v.target.value.length > 0) {
															setEventInput(v.target.value);
														} else {
															setEventInput("");
														}
														console.log(v.target.value);
													}}
												>
													<>
														{signUpModalDesicion == "Volunteering" ? (
															<>
																<option value="">Select an event</option>
																{events
																	.filter((thing) => thing.isTutoring == false)
																	.filter(
																		(thing) =>
																			new Date(
																				parseInt(thing.date.split("-")[0]),
																				parseInt(thing.date.split("-")[1]) - 1,
																				parseInt(thing.date.split("-")[2])
																			).getTime() >=
																			new Date().getTime() - 86400000
																	)
																	.map((e) => (
																		<option
																			value={e.eventName}
																			key={events.indexOf(e) + "di"}
																		>
																			{e.eventName}
																		</option>
																	))}
															</>
														) : (
															<>
																<option value="">Select an event</option>
																{events
																	.filter((thing) => thing.isTutoring == true)
																	.filter(
																		(thing) =>
																			new Date(
																				parseInt(thing.date.split("-")[0]),
																				parseInt(thing.date.split("-")[1]) - 1,
																				parseInt(thing.date.split("-")[2])
																			).getTime() >=
																			new Date().getTime() - 86400000
																	)
																	.map((e) => (
																		<option
																			value={e.eventName}
																			key={events.indexOf(e) + "di"}
																		>
																			{e.eventName + " - " + e.date}
																		</option>
																	))}
															</>
														)}
													</>
												</select>
												<button
													className="LoadButton-pushable my-2"
													onClick={() => addVolunteerDb()}
												>
													<span className="LoadButton-shadow"></span>
													<span className="LoadButton-edge"></span>
													<span className="LoadButton-front text">Submit</span>
												</button>
											</>
										)}
									</div>
								</div>
							) : (
								<></>
							)}
							{showLeaveEventModal ? (
								<div id={`${styles.signUpModal}`}>
									<div id={`${styles.signUpModalContent}`}>
										<Image
											src={"/img/close.svg"}
											width={30}
											height={30}
											onClick={() =>
												setShowLeaveEventModal(!showLeaveEventModal)
											}
											id={`${styles.closeModal}`}
											alt="Close modal"
										/>
										<h1>Leave Event</h1>
										<p className="mb-2">
											Enter email & password for member verification
										</p>
										<input
											type="email"
											placeholder="Email"
											value={email}
											onChange={(v) => setEmail(v.target.value)}
										/>
										<input
											type="password"
											placeholder="Password"
											value={password}
											onChange={(v) => setPassword(v.target.value)}
										/>
										<p className="mb-2">Volunteering or tutoring?</p>
										<select
											value={leaveEventModalDesicion}
											onChange={(v) => {
												if (v.target.value.length > 0) {
													setLeaveEventModalDesicion(v.target.value);
												} else {
													setLeaveEventModalDesicion("Volunteering");
												}
											}}
										>
											<option>Volunteering</option>
											<option>Tutoring</option>
										</select>
										<p className="mb-2">Select event to leave</p>
										<select
											value={eventInput}
											onChange={(v) => {
												if (v.target.value.length > 0) {
													setEventInput(v.target.value);
												} else {
													setEventInput("");
												}
												console.log(v.target.value);
											}}
										>
											<>
												{leaveEventModalDesicion == "Volunteering" ? (
													<>
														{events
															.filter((thing) => thing.isTutoring == false)
															.filter(
																(thing) =>
																	new Date(
																		parseInt(thing.date.split("-")[0]),
																		parseInt(thing.date.split("-")[1]) - 1,
																		parseInt(thing.date.split("-")[2])
																	).getTime() >=
																	new Date().getTime() - 86400000
															)
															.map((e) => (
																<option
																	value={e.eventName}
																	key={events.indexOf(e) + "di"}
																>
																	{e.eventName}
																</option>
															))}
													</>
												) : (
													<>
														{events
															.filter((thing) => thing.isTutoring == true)
															.filter(
																(thing) =>
																	new Date(
																		parseInt(thing.date.split("-")[0]),
																		parseInt(thing.date.split("-")[1]) - 1,
																		parseInt(thing.date.split("-")[2])
																	).getTime() >=
																	new Date().getTime() - 86400000
															)
															.map((e) => (
																<option
																	value={e.eventName}
																	key={events.indexOf(e) + "di"}
																>
																	{e.eventName + " - " + e.date}
																</option>
															))}
													</>
												)}
											</>
										</select>
										<button
											className="LoadButton-pushable my-2"
											onClick={() => removeVolunteerDb()}
										>
											<span className="LoadButton-shadow"></span>
											<span className="LoadButton-edge"></span>
											<span className="LoadButton-front text">Submit</span>
										</button>
									</div>
								</div>
							) : (
								<></>
							)}
							<Table
								minHeight={"20vh"}
								maxHeight={"85vh"}
								bgColor={"rgba(0,0,0,0.2)"}
								widthVal={"90%"}
								// className="swipeFromRight"
								useArrow
							>
								<div className="d-flex justify-content-center w-100">
									<div
										className={`row w-100 ${styles.tableUpcomingEventsItem}`}
									>
										{events.filter((event) => {
											if (!isMobile()) {
												// Filter out events that are tutoring
												const isTutoring = event.isTutoring == false;

												// Filter out events that are in the past
												const isNotInPast =
													new Date(
														parseInt(event.date.split("-")[0]),
														parseInt(event.date.split("-")[1]) - 1,
														parseInt(event.date.split("-")[2])
													).getTime() >=
													new Date().getTime() - 86400000;

												const checkPast = (dat: string) => {
													return (
														new Date(
															parseInt(dat.split("-")[0]),
															parseInt(dat.split("-")[1]) - 1,
															parseInt(dat.split("-")[2])
														).getTime() >=
														new Date().getTime() - 86400000
													);
												};

												// Filter out events that are not tutoring and are not in the past
												const isValidEvent = isTutoring && isNotInPast;

												// Filter out events that are not tutoring and are not in the past
												// Return events that are not tutoring and are not in the past and are on the even index
												return isValidEvent;
											} else {
												const checkPast = (dat: string) => {
													return (
														new Date(
															parseInt(dat.split("-")[0]),
															parseInt(dat.split("-")[1]) - 1,
															parseInt(dat.split("-")[2])
														).getTime() >=
														new Date().getTime() - 86400000
													);
												};

												return (
													events
														.filter(
															(er: any) =>
																checkPast(er.date) && er.isTutoring == false
														)
														.indexOf(event) <=
														Math.ceil(events.length / 2 - 1) &&
													checkPast(event.date) &&
													event.isTutoring == false
												);
											}
										}).length > 0 ? (
											<>
												<div className={`col-lg-6`}>
													{events
														.filter((event) => {
															if (!isMobile()) {
																// Filter out events that are tutoring
																const isTutoring = event.isTutoring == false;

																// Filter out events that are in the past
																const isNotInPast =
																	new Date(
																		parseInt(event.date.split("-")[0]),
																		parseInt(event.date.split("-")[1]) - 1,
																		parseInt(event.date.split("-")[2])
																	).getTime() >=
																	new Date().getTime() - 86400000;

																const checkPast = (dat: string) => {
																	return (
																		new Date(
																			parseInt(dat.split("-")[0]),
																			parseInt(dat.split("-")[1]) - 1,
																			parseInt(dat.split("-")[2])
																		).getTime() >=
																		new Date().getTime() - 86400000
																	);
																};

																// Filter out events that are not tutoring and are not in the past
																const isValidEvent = isTutoring && isNotInPast;

																// Filter out events that are not tutoring and are not in the past
																const isEvenIndex =
																	events
																		.filter(
																			(event) =>
																				event.isTutoring == false &&
																				checkPast(event.date)
																		)
																		.indexOf(event) %
																		2 ==
																	0;

																// Return events that are not tutoring and are not in the past and are on the even index
																return isValidEvent && isEvenIndex;
															} else {
																const checkPast = (dat: string) => {
																	return (
																		new Date(
																			parseInt(dat.split("-")[0]),
																			parseInt(dat.split("-")[1]) - 1,
																			parseInt(dat.split("-")[2])
																		).getTime() >=
																		new Date().getTime() - 86400000
																	);
																};

																return (
																	checkPast(event.date) &&
																	event.isTutoring == false
																);
															}
														})
														.map((e) => {
															return (
																<div
																	className={`${styles.event} mb-2`}
																	key={events.indexOf(e) + "event"}
																>
																	<h2>{e.eventName}</h2>
																	<Table
																		widthVal={"95%"}
																		bgColor="rgba(0,0,0,0.2)"
																		minHeight={"10vh"}
																		maxHeight={"40vh"}
																	>
																		<div className="d-flex justify-content-center w-100 align-items-center">
																			<div className={`${styles.eventCard}`}>
																				<div className="">
																					<p>
																						<b>Date</b>
																					</p>
																					<p>{e.date}</p>
																				</div>
																				<div className="">
																					<p>
																						<b>Location</b>
																					</p>
																					<p>{e.location}</p>
																				</div>
																				<div className="">
																					<p>
																						<b>Time</b>
																					</p>
																					<p>
																						{e.startTime} - {e.endTime}
																					</p>
																				</div>
																				<div className="">
																					<p>
																						<b>Volunteers Needed</b>
																					</p>
																					<p>
																						{e.volunteersNeeded} (
																						{e.volunteers.length} currently)
																					</p>
																				</div>
																				<div className="">
																					<p>
																						<b>Signed Up</b>
																					</p>
																					<p className="w-100">
																						{e.volunteers.map((v) => {
																							return <>{v}, </>;
																						})}
																					</p>
																				</div>
																			</div>
																		</div>
																	</Table>
																</div>
															);
														})}
												</div>
												<div className={`col-lg-6`}>
													{events
														.filter((event) => {
															if (!isMobile()) {
																// Filter out events that are tutoring
																const isTutoring = event.isTutoring == false;

																// Filter out events that are in the past
																const isNotInPast =
																	new Date(
																		parseInt(event.date.split("-")[0]),
																		parseInt(event.date.split("-")[1]) - 1,
																		parseInt(event.date.split("-")[2])
																	).getTime() >=
																	new Date().getTime() - 86400000;

																const checkPast = (dat: string) => {
																	return (
																		new Date(
																			parseInt(dat.split("-")[0]),
																			parseInt(dat.split("-")[1]) - 1,
																			parseInt(dat.split("-")[2])
																		).getTime() >=
																		new Date().getTime() - 86400000
																	);
																};

																// Filter out events that are not tutoring and are not in the past
																const isValidEvent = isTutoring && isNotInPast;

																// Filter out events that are not tutoring and are not in the past
																const isEvenIndex =
																	events
																		.filter(
																			(event) =>
																				event.isTutoring == false &&
																				checkPast(event.date)
																		)
																		.indexOf(event) %
																		2 ==
																	1;

																// Return events that are not tutoring and are not in the past and are on the even index
																return isValidEvent && isEvenIndex;
															} else {
																const checkPast = (dat: string) => {
																	return (
																		new Date(
																			parseInt(dat.split("-")[0]),
																			parseInt(dat.split("-")[1]) - 1,
																			parseInt(dat.split("-")[2])
																		).getTime() >=
																		new Date().getTime() - 86400000
																	);
																};

																return (
																	events
																		.filter(
																			(er: any) =>
																				checkPast(er.date) &&
																				er.isTutoring == false
																		)
																		.indexOf(event) >
																		Math.ceil(events.length / 2 - 1) &&
																	checkPast(event.date) &&
																	event.isTutoring == false
																);
															}
														})
														.map((e) => {
															return (
																<div
																	className={`${styles.event} mb-2`}
																	key={events.indexOf(e) + "event"}
																>
																	<h2>{e.eventName}</h2>
																	<Table
																		widthVal={"95%"}
																		bgColor="rgba(0,0,0,0.2)"
																		minHeight={"10vh"}
																		maxHeight={"40vh"}
																	>
																		<div className="d-flex justify-content-center w-100 align-items-center">
																			<div className={`${styles.eventCard}`}>
																				<div className="">
																					<p>
																						<b>Date</b>
																					</p>
																					<p>{e.date}</p>
																				</div>
																				<div className="">
																					<p>
																						<b>Location</b>
																					</p>
																					<p>{e.location}</p>
																				</div>
																				<div className="">
																					<p>
																						<b>Time</b>
																					</p>
																					<p>
																						{e.startTime} - {e.endTime}
																					</p>
																				</div>
																				<div className="">
																					<p>
																						<b>Volunteers Needed</b>
																					</p>
																					<p>
																						{e.volunteersNeeded} (
																						{e.volunteers.length} currently)
																					</p>
																				</div>
																				<div className="">
																					<p>
																						<b>Signed Up</b>
																					</p>
																					<p className="w-100">
																						{e.volunteers.map((v) => {
																							return <>{v}, </>;
																						})}
																					</p>
																				</div>
																			</div>
																		</div>
																	</Table>
																</div>
															);
														})}
												</div>
											</>
										) : (
											<div className="w-100 h-100 d-flex justify-content-center align-items-center">
												<p>
													<b>No volunteer events have been created yet</b>
												</p>
											</div>
										)}
									</div>
								</div>
							</Table>
						</>
						<>
							<h2 className="mt-3">Tutoring</h2>
							<p className="mb-2">Use the same buttons as above</p>
							<Table
								minHeight={"20vh"}
								maxHeight={"85vh"}
								bgColor={"rgba(0,0,0,0.2)"}
								widthVal={"90%"}
								useArrow
							>
								<div className="d-flex justify-content-center w-100">
									{events.filter((event) => {
										if (!isMobile()) {
											// Filter out events that are tutoring
											const isTutoring = event.isTutoring == true;

											// Filter out events that are in the past
											const isNotInPast =
												new Date(
													parseInt(event.date.split("-")[0]),
													parseInt(event.date.split("-")[1]) - 1,
													parseInt(event.date.split("-")[2])
												).getTime() >=
												new Date().getTime() - 86400000;

											const checkPast = (dat: string) => {
												return (
													new Date(
														parseInt(dat.split("-")[0]),
														parseInt(dat.split("-")[1]) - 1,
														parseInt(dat.split("-")[2])
													).getTime() >=
													new Date().getTime() - 86400000
												);
											};

											// Filter out events that are not tutoring and are not in the past
											const isValidEvent = isTutoring && isNotInPast;

											// Filter out events that are not tutoring and are not in the past
											// Return events that are not tutoring and are not in the past and are on the even index
											return isValidEvent;
										} else {
											const checkPast = (dat: string) => {
												return (
													new Date(
														parseInt(dat.split("-")[0]),
														parseInt(dat.split("-")[1]) - 1,
														parseInt(dat.split("-")[2])
													).getTime() >=
													new Date().getTime() - 86400000
												);
											};

											return checkPast(event.date) && event.isTutoring == true;
										}
									}).length > 0 ? (
										<div
											className={`row w-100 ${styles.tableUpcomingEventsItem}`}
										>
											<div className={`col-lg-4`}>
												{events
													.filter((event) => {
														if (!isMobile()) {
															// Filter out events that are tutoring
															const isTutoring = event.isTutoring == true;

															// Filter out events that are in the past
															const isNotInPast =
																new Date(
																	parseInt(event.date.split("-")[0]),
																	parseInt(event.date.split("-")[1]) - 1,
																	parseInt(event.date.split("-")[2])
																).getTime() >=
																new Date().getTime() - 86400000;

															const checkPast = (dat: string) => {
																return (
																	new Date(
																		parseInt(dat.split("-")[0]),
																		parseInt(dat.split("-")[1]) - 1,
																		parseInt(dat.split("-")[2])
																	).getTime() >=
																	new Date().getTime() - 86400000
																);
															};

															// Filter out events that are not tutoring and are not in the past
															const isValidEvent = isTutoring && isNotInPast;

															// Filter out events that are not tutoring and are not in the past
															const isEvenIndex =
																events
																	.filter(
																		(event) =>
																			event.isTutoring == true &&
																			checkPast(event.date)
																	)
																	.indexOf(event) %
																	3 ==
																0;

															// Return events that are not tutoring and are not in the past and are on the even index
															return isValidEvent && isEvenIndex;
														} else {
															const checkPast = (dat: string) => {
																return (
																	new Date(
																		parseInt(dat.split("-")[0]),
																		parseInt(dat.split("-")[1]) - 1,
																		parseInt(dat.split("-")[2])
																	).getTime() >=
																	new Date().getTime() - 86400000
																);
															};

															return (
																events.indexOf(event) <
																	Math.ceil(events.length / 3) &&
																checkPast(event.date) &&
																event.isTutoring == true
															);
														}
													})
													.map((e) => {
														return (
															<div
																className={`${styles.event} mb-2`}
																key={events.indexOf(e) + "event"}
															>
																<h2>{e.eventName}</h2>
																<Table
																	widthVal={"95%"}
																	bgColor="rgba(0,0,0,0.2)"
																	minHeight={"10vh"}
																	maxHeight={"40vh"}
																>
																	<div className="d-flex justify-content-center w-100 align-items-center">
																		<div className={`${styles.eventCard}`}>
																			<div className="">
																				<p>
																					<b>Date</b>
																				</p>
																				<p>{e.date}</p>
																			</div>
																			<div className="">
																				<p>
																					<b>Room</b>
																				</p>
																				<p>{e.location}</p>
																			</div>
																			<div className="">
																				<p>
																					<b>End Time</b>
																				</p>
																				<p>{e.endTime}</p>
																			</div>
																			<div className="">
																				<p>
																					<b>Tutors Needed</b>
																				</p>
																				<p>{e.volunteersNeeded}</p>
																			</div>
																			<div className="">
																				<p>
																					<b>Host</b>
																				</p>
																				<p>{e.tutorHost}</p>
																			</div>
																			<div>
																				<p>
																					<b>Teachers</b> {e.teachers}
																				</p>
																			</div>
																			<div className="">
																				<p>
																					<b>Signed Up</b>
																				</p>
																				<p className="w-100">
																					{e.volunteers.map((v) => {
																						return <>{v}, </>;
																					})}
																				</p>
																			</div>
																		</div>
																	</div>
																</Table>
															</div>
														);
													})}
											</div>
											<div className={`col-lg-4`}>
												{events
													.filter((event) => {
														if (!isMobile()) {
															// Filter out events that are tutoring
															const isTutoring = event.isTutoring == true;

															// Filter out events that are in the past
															const isNotInPast =
																new Date(
																	parseInt(event.date.split("-")[0]),
																	parseInt(event.date.split("-")[1]) - 1,
																	parseInt(event.date.split("-")[2])
																).getTime() >=
																new Date().getTime() - 86400000;

															const checkPast = (dat: string) => {
																return (
																	new Date(
																		parseInt(dat.split("-")[0]),
																		parseInt(dat.split("-")[1]) - 1,
																		parseInt(dat.split("-")[2])
																	).getTime() >=
																	new Date().getTime() - 86400000
																);
															};

															// Filter out events that are not tutoring and are not in the past
															const isValidEvent = isTutoring && isNotInPast;

															// Filter out events that are not tutoring and are not in the past
															const isEvenIndex =
																events
																	.filter(
																		(event) =>
																			event.isTutoring == true &&
																			checkPast(event.date)
																	)
																	.indexOf(event) %
																	3 ==
																1;

															// Return events that are not tutoring and are not in the past and are on the even index
															return isValidEvent && isEvenIndex;
														} else {
															const checkPast = (dat: string) => {
																return (
																	new Date(
																		parseInt(dat.split("-")[0]),
																		parseInt(dat.split("-")[1]) - 1,
																		parseInt(dat.split("-")[2])
																	).getTime() >=
																	new Date().getTime() - 86400000
																);
															};

															return (
																events.indexOf(event) >=
																	Math.ceil(events.length / 3) &&
																events.indexOf(event) <
																	Math.ceil(events.length / 3) * 2 &&
																checkPast(event.date) &&
																event.isTutoring == true
															);
														}
													})
													.map((e) => {
														return (
															<div
																className={`${styles.event} mb-2`}
																key={events.indexOf(e) + "event"}
															>
																<h2>{e.eventName}</h2>
																<Table
																	widthVal={"95%"}
																	bgColor="rgba(0,0,0,0.2)"
																	minHeight={"10vh"}
																	maxHeight={"40vh"}
																>
																	<div className="d-flex justify-content-center w-100 align-items-center">
																		<div className={`${styles.eventCard}`}>
																			<div className="">
																				<p>
																					<b>Date</b>
																				</p>
																				<p>{e.date}</p>
																			</div>
																			<div className="">
																				<p>
																					<b>Room</b>
																				</p>
																				<p>{e.location}</p>
																			</div>
																			<div className="">
																				<p>
																					<b>End Time</b>
																				</p>
																				<p>{e.endTime}</p>
																			</div>

																			<div className="">
																				<p>
																					<b>Tutors Needed</b>
																				</p>
																				<p>{e.volunteersNeeded}</p>
																			</div>
																			<div className="">
																				<p>
																					<b>Host</b>
																				</p>
																				<p>{e.tutorHost}</p>
																			</div>
																			<div>
																				<p>
																					<b>Teachers</b> {e.teachers}
																				</p>
																			</div>
																			<div className="">
																				<p>
																					<b>Signed Up</b>
																				</p>
																				<p className="w-100">
																					{e.volunteers.map((v) => {
																						return <>{v}, </>;
																					})}
																				</p>
																			</div>
																		</div>
																	</div>
																</Table>
															</div>
														);
													})}
											</div>
											<div className={`col-lg-4`}>
												{events
													.filter((event) => {
														if (!isMobile()) {
															// Filter out events that are tutoring
															const isTutoring = event.isTutoring == true;

															// Filter out events that are in the past
															const isNotInPast =
																new Date(
																	parseInt(event.date.split("-")[0]),
																	parseInt(event.date.split("-")[1]) - 1,
																	parseInt(event.date.split("-")[2])
																).getTime() >=
																new Date().getTime() - 86400000;

															const checkPast = (dat: string) => {
																return (
																	new Date(
																		parseInt(dat.split("-")[0]),
																		parseInt(dat.split("-")[1]) - 1,
																		parseInt(dat.split("-")[2])
																	).getTime() >=
																	new Date().getTime() - 86400000
																);
															};

															// Filter out events that are not tutoring and are not in the past
															const isValidEvent = isTutoring && isNotInPast;

															// Filter out events that are not tutoring and are not in the past
															const isEvenIndex =
																events
																	.filter(
																		(event) =>
																			event.isTutoring == true &&
																			checkPast(event.date)
																	)
																	.indexOf(event) %
																	3 ==
																2;

															// Return events that are not tutoring and are not in the past and are on the even index
															return isValidEvent && isEvenIndex;
														} else {
															const checkPast = (dat: string) => {
																return (
																	new Date(
																		parseInt(dat.split("-")[0]),
																		parseInt(dat.split("-")[1]) - 1,
																		parseInt(dat.split("-")[2])
																	).getTime() >=
																	new Date().getTime() - 86400000
																);
															};

															return (
																events.indexOf(event) >=
																	Math.ceil(events.length / 3) * 2 &&
																checkPast(event.date) &&
																event.isTutoring == true
															);
														}
													})
													.map((e) => {
														return (
															<div
																className={`${styles.event} mb-2`}
																key={events.indexOf(e) + "event"}
															>
																<h2>{e.eventName}</h2>
																<Table
																	widthVal={"95%"}
																	bgColor="rgba(0,0,0,0.2)"
																	minHeight={"10vh"}
																	maxHeight={"40vh"}
																>
																	<div className="d-flex justify-content-center w-100 align-items-center">
																		<div className={`${styles.eventCard}`}>
																			<div className="">
																				<p>
																					<b>Date</b>
																				</p>
																				<p>{e.date}</p>
																			</div>
																			<div className="">
																				<p>
																					<b>Room</b>
																				</p>
																				<p>{e.location}</p>
																			</div>
																			<div className="">
																				<p>
																					<b>End Time</b>
																				</p>
																				<p>{e.endTime}</p>
																			</div>
																			<div className="">
																				<p>
																					<b>Tutors Needed</b>
																				</p>
																				<p>{e.volunteersNeeded}</p>
																			</div>
																			<div className="">
																				<p>
																					<b>Host</b>
																				</p>
																				<p>{e.tutorHost}</p>
																			</div>
																			<div>
																				<p>
																					<b>Teachers</b> {e.teachers}
																				</p>
																			</div>
																			<div className="">
																				<p>
																					<b>Signed Up</b>
																				</p>
																				<p className="w-100">
																					{e.volunteers.map((v) => {
																						return <>{v}, </>;
																					})}
																				</p>
																			</div>
																		</div>
																	</div>
																</Table>
															</div>
														);
													})}
											</div>
										</div>
									) : (
										<div className="w-100 h-100 d-flex justify-content-center align-items-center">
											<p>
												<b>No tutoring events have been created yet</b>
											</p>
										</div>
									)}
								</div>
							</Table>
						</>
					</section>
				</div>
			</main>
		</SecLayout>
	);
}
