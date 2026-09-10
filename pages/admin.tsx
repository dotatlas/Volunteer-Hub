/* eslint-disable react/no-unescaped-entities */
// Imports
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import Script from "next/script";
import { Ref, useEffect, useRef, useState } from "react";
import { ExportToCsv } from "export-to-csv";
import {
	checkAdmin,
	getAccounts,
	AccInterface,
	updateMember,
	deleteMember,
	makeMemberAdmin,
	makeMemberNotAdmin,
	eventProps,
	getEvents,
	addEvent,
	deleteEvent,
	deleteCollectionData,
	getMessagesArray,
	messageInterface,
	deleteMessage,
	mapableHoursRequestProps,
	getHoursRequestsArray,
	approveHoursRequest,
	denyHoursRequest,
} from "../goApi";
import * as EmailValidator from "email-validator";
import { useEffectOnce } from "usehooks-ts";
import Confetti from "react-confetti";
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useWindowSize } from "usehooks-ts";
import tutoringEventsss from "../eventPresets.json";

// CSS imports
import styles from "../styles/pages/Admin.module.css";

// Component imports
import PageTitle from "../components/parts/PageTitle";
import Table from "../components/parts/Table";
import Collapsable from "../components/parts/Collapsable";
import { data } from "jquery";
import Gifs from "../components/funny/Gifs";
import Laser from "../components/funny/Laser";
import SecLayout from "../components/_seclayout";

// Interface for function
interface AdminProps {
	email: string;
	password: string;
}

// Page
export default function Admin() {
	const controls = useAnimation();
	const secondControls = useAnimation();
	const [ref, inView] = useInView();
	const [secondRef, secondInView] = useInView();
	const [isConfettiExploding, setIsConfettiExploding] = useState(false);
	const [isLaserRunning, setIsLaserRunning] = useState(false);
	const [isGifRunning, setIsGifRunning] = useState(false);

	const setFunny = (para: boolean) => {
		setIsConfettiExploding(para);
		setIsLaserRunning(para);
		setIsGifRunning(para);
	};

	const { width, height } = useWindowSize();
	useEffect(() => {
		if (inView) {
			controls.start("visible");
		}
	}, [controls, inView]);
	useEffect(() => {
		if (secondInView) {
			secondControls.start("visible");
		}
	}, [secondControls, secondInView]);

	// Basically says that the accounts state is an array of the AccInterface type
	interface Accounts {
		accounts: Array<AccInterface>;
	}

	interface msgs {
		messages: Array<messageInterface>;
	}

	// States for the page
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [isUserAdmin, setIsUserAdmin] = useState(false);
	const [showLoading, setShowLoading] = useState(false);
	const [accounts, setAccounts] = useState<Accounts>({ accounts: [] });
	const [messages, setMessages] = useState<msgs>({ messages: [] });
	const [hourRequests, setHourRequests] = useState<mapableHoursRequestProps[]>(
		[]
	);

	// Table Loading states
	const [pendingMemberTableLoading, setPendingMemberTableLoading] =
		useState(false);

	/* Check if user is admin changing state to true if they are
	 * @param {AdminProps} email, password
	 * @return {void}
	 */
	const adminButtonClicked = async ({ email, password }: AdminProps) => {
		await setShowLoading(true);
		if (
			email == "" ||
			password == "" ||
			email == undefined ||
			password == undefined
		) {
			setShowLoading(false);
			alert("Please enter an email and password");
			return;
		} else if (!EmailValidator.validate(email)) {
			setShowLoading(false);
			alert("Please enter a valid email");
			return;
		} else if (password.length < 8) {
			setShowLoading(false);
			alert("Please enter a password with at least 8 characters");
			return;
		} else {
			let res = await checkAdmin({ email, password });
			setIsUserAdmin(res);
			setShowLoading(false);
			//alert("You can use spaces now btw");
		}
	};

	/* Get accounts
	 * @param {void}
	 * @return {Promise}
	 */
	const getHourRequests = async () => {
		return await getHoursRequestsArray();
	};
	/* Get accounts on page load
	 * @param {void}
	 * @return {void}
	 */
	useEffect(() => {
		const getAccAwait = async () => {
			return await getAccounts();
		};
		const getEventAwait = async () => {
			return await getEvents();
		};
		const getMessagesAwait = async () => {
			return await getMessagesArray();
		};
		const getHourRequests = async () => {
			return await getHoursRequestsArray();
		};
		getAccAwait().then((res) => {
			setAccounts({ accounts: res });
			getEventAwait().then((res) => {
				setEvents({ events: res });
			});
			getMessagesAwait().then((res) => {
				setMessages({ messages: res });
			});
			getHourRequests().then((res) => {
				setHourRequests(res);
			});
		});
	}, []);

	/* Approve pending member removing them from the state and database
	 * @param {number} index
	 * @return {void}
	 */
	const approvePendingMember = async (index: number) => {
		const accs: any = accounts.accounts;
		await updateMember(accs[index].firstName + " " + accs[index].lastName, {
			isVerified: true,
		});

		let thing = accs.filter(
			(item: any) =>
				item.firstName + " " + item.lastName !=
				accs[index].firstName + " " + accs[index].lastName
		) as any;

		setAccounts({
			accounts: thing,
		});
		setFunny(true);

		await refreshAccounts();
		setTimeout(() => {
			setFunny(false);
		}, 3000);
	};

	/* Deny pending member removing them from the state and database
	 * @param {number} index
	 * @return {void}
	 */
	const denyPendingMember = async (index: number) => {
		const accs: any = accounts.accounts;
		await deleteMember(
			accounts.accounts[index].firstName +
				" " +
				accounts.accounts[index].lastName
		);

		let thing = accs.filter(
			(item: any) =>
				item.firstName + " " + item.lastName !=
				accs[index].firstName + " " + accs[index].lastName
		) as any;

		setAccounts({
			accounts: thing,
		});
		await refreshAccounts();
	};

	/* Refresh accounts updating the state
	 * @param {void}
	 * @return {void}
	 */
	const refreshAccounts = async () => {
		return new Promise(async (resolve, reject) => {
			await getAccounts().then((res) => {
				setAccounts({ accounts: res });
				resolve(res);
			});
		});
	};

	const refreshMessages = async () => {
		return new Promise(async (resolve, reject) => {
			await getMessagesArray().then((res) => {
				setMessages({ messages: res });
				resolve(res);
			});
		});
	};

	const refreshHourRequests = async () => {
		return new Promise(async (resolve, reject) => {
			await getHoursRequestsArray().then((res) => {
				setHourRequests(res);
				resolve(res);
			});
		});
	};

	/* Export member list to spreadsheet
	 * @param {accounts}? (
? (
? (
? (
	 * @return {void}
	 * TODO: Implement
	 */
	const exportMemberListToSpreadsheet = async (accounts: Array<object>) => {
		let betterAccounts = accounts.map((item: any) => {
			return {
				First_Name: item.firstName,
				Last_Name: item.lastName,
				Email: item.email,
				Grade: item.grade,
				VolunteerHours: item.volunteerHours,
				TutoringHours: item.tutoringHours,
			};
		});

		const options = {
			fieldSeparator: ",",
			filename: "MemberInfoList",
			quoteStrings: '"',
			decimalSeparator: ".",
			showLabels: true,
			showTitle: true,
			title: "NHS Member List",
			useTextFile: false,
			useBom: true,
			headers: [
				"First Name",
				"Last Name",
				"Email",
				"Grade",
				"Volunteer Hours",
				"Tutoring Hours",
			],
			// useKeysAsHeaders: true, // headers: ['Column 1', 'Column 2', etc...] <-- Won't work with useKeysAsHeaders present!
		};
		const csvExporter = new ExportToCsv(options);
		csvExporter.generateCsv(betterAccounts);
		alert(
			"Put the file in google drive and it will interpret it as a spreadsheet"
		);
		// console.log(await getAccAwait());
	};

	const makeMemberAdminRemove = async (name: string) => {
		await makeMemberAdmin(name);
		await refreshAccounts();
	};

	const makeMemberNotAdminRemove = async (name: string) => {
		await makeMemberNotAdmin(name);
		await refreshAccounts();
	};

	interface EventsStateProp {
		events: Array<eventProps>;
	}

	const [eventName, setEventName] = useState("");
	const [eventDate, setEventDate] = useState("");
	const [eventLocation, setEventLocation] = useState("");
	const [eventStartTime, setEventStartTime] = useState("");
	const [eventEndTime, setEventEndTime] = useState("");
	const [eventVolunteersNeeded, setEventVolunteersNeeded] = useState("");
	const [eventVolunteersSignedUp, setEventVolunteersSignedUp] = useState([]);
	const [events, setEvents] = useState<EventsStateProp>({ events: [] });
	const [eventIsTutoring, setEventIsTutoring] = useState<boolean>(false);
	const [tutoringHost, setTutoringHost] = useState<string>("");
	const [tutoringTeachers, setTutoringTeachers] = useState<string>("");

	/* Refresh accounts updating the state
	 * @param {void}
	 * @return {void}
	 */

	const refreshEvents = async () => {
		return new Promise(async (resolve, reject) => {
			await getEvents().then((res) => {
				setEvents({ events: res });
				resolve(res);
			});
		});
	};

	const addEventRefresh = async () => {
		// console.log({
		// 	eventName: eventName,
		// 	date: eventDate,
		// 	location: eventLocation,
		// 	startTime: eventStartTime,
		// 	endTime: eventEndTime,
		// 	volunteersNeeded: eventVolunteersNeeded,
		// 	volunteers: eventVolunteersSignedUp,
		// });
		if (
			eventName == "" ||
			eventDate == "" ||
			eventLocation == "" ||
			// eventStartTime == "" ||
			eventEndTime == "" ||
			eventVolunteersNeeded == "" ||
			// tutoringHost == "" ||
			eventName == undefined ||
			eventDate == undefined ||
			eventLocation == undefined ||
			// eventStartTime == undefined ||
			eventEndTime == undefined ||
			eventVolunteersNeeded == undefined ||
			eventIsTutoring == undefined
			// tutoringHost == undefined
		) {
			alert("Please fill out all fields");
			return;
		}
		if (
			isNaN(parseInt(eventVolunteersNeeded)) ||
			eventVolunteersNeeded == "0"
		) {
			alert("Please enter a number for volunteers needed");
			return;
		}

		addEvent({
			eventName: eventName,
			date: eventDate,
			location: eventLocation,
			startTime: eventStartTime,
			endTime: eventEndTime,
			volunteersNeeded: eventVolunteersNeeded,
			volunteers: eventVolunteersSignedUp,
			isTutoring: eventIsTutoring,
			tutorHost: tutoringHost,
			teachers: tutoringTeachers,
		}).then(async () => {
			setEvents({
				events: [
					...events.events,
					{
						eventName: eventName,
						date: eventDate,
						location: eventLocation,
						startTime: eventStartTime,
						endTime: eventEndTime,
						volunteersNeeded: eventVolunteersNeeded,
						volunteers: eventVolunteersSignedUp,
						isTutoring: eventIsTutoring,
						tutorHost: tutoringHost,
						teachers: tutoringTeachers,
					},
				],
			});
			await refreshEvents();
		});
	};

	const deleteEventRefresh = async (name: string, datee: string) => {
		await deleteEvent(name, datee);
		setEvents({
			events: events.events.filter(
				(event) => event.eventName !== name && event.date !== datee
			),
		});
		await refreshEvents();
	};

	const loadItemsButtonRef = useRef<HTMLButtonElement>(null);
	const deleteRefItem = async (ref: any) => {
		if (ref.current) {
			for (let i = 0; i < ref.current.children.length; i++) {
				ref.current.removeChild(ref.current.children[i]);
			}
			ref.current.remove();
		}
	};

	const [hoursName, setHoursName] = useState("");
	const [hoursNewVolunteerHours, setHoursNewVolunteerHours] =
		useState<Number>(0);
	const [hoursNewTutoringHours, setHoursNewTutoringHours] = useState<Number>(0);

	const [showTutoringEvents, setShowTutoringEvents] = useState<boolean>(false);

	const deleteAccountCollectionRefresh = async (collection: string) => {
		const pss = prompt("Enter owner password") as string;

		if (pss !== "bigman") {
			alert("Wrong password");
			return;
		}

		await deleteCollectionData(collection);

		setAccounts({
			// accounts: accounts.accounts.filter(
			// 	(account) => account.isVerified != true
			// ),
			accounts: [],
		});
		// await refreshAccounts();
	};

	const deleteMessageRefresh = async (name: string) => {
		await deleteMessage(name);
		setMessages({
			messages: messages.messages.filter((message) => message.name !== name),
		});
	};
	interface tutoringPresetsInterface {
		subject: string;
		room: string;
		teachers: string;
		endTime: string;
		tutorsNeeded: string;
	}

	const [tutoringPresets, setTutoringPresets] = useState<
		tutoringPresetsInterface[]
	>([
		// {
		// 	subject: "DB no worky",
		// 	room: "",
		// 	teachers: "😿",
		// 	endTime: "",
		// 	tutorsNeeded: "",
		// },
	]);

	// useEffect(() => {
	// 	// https request to https://json.extendsclass.com/bin/de5f28ec2add and make text to json
	// 	fetch("https://json.extendsclass.com/bin/de5f28ec2add")
	// 		.then((response) => response.json())
	// 		.then((data) => {
	// 			setTutoringPresets(data.tutoringEvents);
	// 			// console.log(data.tutoringEvents);
	// 		});
	// }, []);

	return (
		<SecLayout>
			{/* Meta tags */}
			<Head>
				<title>Lyman NHS</title>
				<link rel="canonical" href="https://lymannhs.netlify.app/admin" />
			</Head>

			{/* ! Main homepage content */}

			<main>
				{isUserAdmin ? (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
					>
						<PageTitle title="NHS Admin" />
						<div id={`${styles.notTitle}`}>
							<section
								className={`${styles.adminSection} container-sm text-center`}
							>
								<h1>Profile Managment</h1>
								{/* ! Uncomment if reads in db become too much */}
								<button
									className="LoadButton-pushable my-2"
									onClick={async () => {
										await refreshAccounts();
										await refreshEvents();
										await refreshMessages();
										await refreshHourRequests();
										// deleteRefItem(loadItemsButtonRef);
									}}
									ref={loadItemsButtonRef}
								>
									<span className="LoadButton-shadow"></span>
									<span className="LoadButton-edge"></span>
									<span className="LoadButton-front text">Refresh Items</span>
								</button>
								<div className="row">
									<div
										className="col-lg-6 d-flex align-items-center flex-column"
										id={`${styles.pendingMembers}`}
									>
										<h2>Pending Members</h2>
										<p>
											New profiles show below here and require approval before
											being added to the member list
										</p>
										<Table
											maxHeight={"80vh"}
											minHeight={"20vh"}
											bgColor={"rgba(0,0,0,0.2)"}
											useArrow
										>
											{/* Maps through all accounts that are pending and displays them */}
											{/* If there are no pending accounts, display a message */}
											{accounts.accounts.filter(
												(item) => item.isVerified == false
											).length > 0 ? (
												accounts.accounts
													.filter((item) => item.isVerified == false)
													.map((account) => {
														return (
															<div
																key={accounts.accounts.indexOf(account)}
																className={`${styles.pendingMember} w-100`}
															>
																<div className="d-flex justify-content-between w-100 flex-row">
																	<div className={`${styles.MemberItemText}`}>
																		<Collapsable
																			initText={
																				account.firstName +
																				" " +
																				account.lastName
																			}
																			className="w-100"
																		>
																			<p>
																				<b>Email:</b> {account.email}
																			</p>
																			<p>
																				<b>Grade:</b> {account.grade}
																			</p>
																		</Collapsable>
																	</div>

																	<div
																		className=""
																		id={styles.approvalButtonsDiv}
																	>
																		<button
																			className="ApproveButton-pushable"
																			onClick={(e) => {
																				approvePendingMember(
																					accounts.accounts.indexOf(account)
																				);
																			}}
																		>
																			<span className="ApproveButton-shadow"></span>
																			<span className="ApproveButton-edge"></span>

																			<span className="ApproveButton-front text">
																				Approve
																			</span>
																		</button>
																		<button
																			className="DenyButton-pushable"
																			onClick={(e) => {
																				denyPendingMember(
																					accounts.accounts.indexOf(account)
																				);
																			}}
																		>
																			<span className="DenyButton-shadow"></span>
																			<span className="DenyButton-edge"></span>

																			<span className="DenyButton-front text">
																				Deny
																			</span>
																		</button>
																	</div>
																</div>
															</div>
														);
													})
											) : (
												<div className="d-flex align-items-center justify-content-center w-100">
													<label className={`${styles.noPending}`}>
														No pending members
													</label>
												</div>
											)}
										</Table>
									</div>
									<div className="col-lg-6 d-flex flex-column align-items-center ">
										<h2>Member List</h2>
										<button
											className="LoadButton-pushable mb-2"
											onClick={() =>
												exportMemberListToSpreadsheet(accounts.accounts)
											}
										>
											<span className="LoadButton-shadow"></span>
											<span className="LoadButton-edge"></span>

											<span className="LoadButton-front text">
												Export to table
											</span>
										</button>
										<Table
											minHeight={"20vh"}
											maxHeight={"80vh"}
											bgColor={"rgba(0,0,0,0.2)"}
											useArrow
										>
											{/* Maps through the accounts array and displays the accounts that are approved */}
											{/* If there are no approved accounts, it will display a message */}
											{accounts.accounts.filter(
												(item) => item.isVerified == true
											).length > 0 ? (
												accounts.accounts
													.filter((item) => item.isVerified == true)
													.map((account) => {
														return (
															<div
																key={accounts.accounts.indexOf(account)}
																className={`${styles.pendingMember} w-100`}
															>
																<div className="d-flex justify-content-between w-100 flex-row">
																	<div className={`${styles.MemberItemText}`}>
																		<Collapsable
																			initText={
																				account.firstName +
																				" " +
																				account.lastName
																			}
																			className={`w-100 ${styles.memberItemThing}`}
																		>
																			<p>
																				<b>Email:</b> {account.email}
																			</p>
																			<p>
																				<b>Grade:</b> {account.grade}
																			</p>
																			<p>
																				<b>Volunteer Hours:</b>{" "}
																				{account.volunteerHours}
																			</p>
																			<p>
																				<b>Tutoring Hours:</b>{" "}
																				{account.tutoringHours}
																			</p>
																			<div className="w-100 overflow-hidden d-flex justify-content-center align-items-center">
																				<button
																					className="DenyButton-pushable mt-2"
																					onClick={async () => {
																						await deleteMember(
																							account.firstName +
																								" " +
																								account.lastName
																						);
																						setAccounts({
																							accounts:
																								accounts.accounts.filter(
																									(item) =>
																										item.firstName +
																											" " +
																											item.lastName !=
																										account.firstName +
																											" " +
																											account.lastName
																								),
																						});
																					}}
																					id={styles.deleteMemberButton}
																				>
																					<span className="DenyButton-shadow"></span>
																					<span className="DenyButton-edge"></span>
																					<span className="DenyButton-front text">
																						Delete member
																					</span>
																				</button>
																			</div>
																		</Collapsable>
																	</div>
																	<div
																		className="d-flex align-items-center justify-content-center flex-row"
																		id={`${styles.adminOptionsDiv}`}
																	>
																		{account.isAdmin != true ? (
																			<button
																				className="ApproveButton-pushable"
																				onClick={(e) => {
																					makeMemberAdminRemove(
																						account.firstName +
																							" " +
																							account.lastName
																					);
																				}}
																			>
																				<span className="ApproveButton-shadow"></span>
																				<span className="ApproveButton-edge"></span>

																				<span className="ApproveButton-front text">
																					Make Admin
																				</span>
																			</button>
																		) : (
																			<button
																				className="DenyButton-pushable"
																				onClick={(e) => {
																					makeMemberNotAdminRemove(
																						account.firstName +
																							" " +
																							account.lastName
																					);
																				}}
																			>
																				<span className="DenyButton-shadow"></span>
																				<span className="DenyButton-edge"></span>

																				<span className="DenyButton-front text">
																					Remove Admin
																				</span>
																			</button>
																		)}
																	</div>
																</div>
															</div>
														);
													})
											) : (
												<div className="d-flex align-items-center justify-content-center w-100">
													<label className={`${styles.noPending}`}>
														No pending members
													</label>
												</div>
											)}
											<div className=" d-flex align-items-center justify-content-center w-100">
												<button
													className="DenyButton-pushable mt-2"
													onClick={() => {
														deleteAccountCollectionRefresh("Accounts");
													}}
													id={styles.deleteAllMembers}
												>
													<span className="DenyButton-shadow"></span>
													<span className="DenyButton-edge"></span>
													<span className="DenyButton-front text">
														Delete all members
													</span>
												</button>
											</div>
										</Table>
									</div>
								</div>
							</section>
							<section
								className={`${styles.adminSection} container-sm text-center`}
							>
								<h1>Events</h1>

								<div className="row">
									<motion.div
										animate={controls}
										ref={ref}
										transition={{
											duration: 0.5,
											ease: [0.5, 0.01, -0.05, 0.9],
										}}
										initial={{ scale: 0 }}
										variants={{
											visible: { scale: 1 },
										}}
										className="col-12 col-lg-6 container-md"
										id={`${styles.addEventForm}`}
									>
										<h2 className="mb-1">Add Event</h2>
										<p>
											Dont use {eventIsTutoring ? `"," "/"` : `"/"`} or the
											website breaks
										</p>
										<div className={`${styles.eventInput} mt-1 mb-1`}>
											<p>Is this a tutoring event?</p>
											<input
												type="checkbox"
												onChange={async (e) => {
													setEventIsTutoring(e.target.checked);
													// try {
													// 	fetch(
													// 		"https://json.extendsclass.com/bin/de5f28ec2add"
													// 	)
													// 		.then((response) => response.json())
													// 		.then((data) => {
													// 			setTutoringPresets(data.tutoringEvents);
													// 			console.log(data.tutoringEvents);
													// 		});
													// } catch (e) {
													// 	console.log(e);
													// }
													// If fetch(https://json.extendsclass.com/bin/de5f28ec2add) works set the state to the data.tutoringEvents
													if (!e.target.checked) return;
													let a = await fetch(
														"https://json.extendsclass.com/bin/de5f28ec2add"
													);
													if (a.ok) {
														setTutoringPresets(
															await a.json().then((data) => data.tutoringEvents)
														);
														console.log(
															"Fetched tutoring presets from database"
														);
													} else {
														// console.log(
														// 	await a.json().then((data) => data.tutoringEvents)
														// );
														// console.log(tutoringEventsss.tutoringEvents);
														// console.log(
														// 	tutoringEventsss.tutoringEvents ==
														// 		(await a
														// 			.json()
														// 			.then((data) => data.tutoringEvents))
														// );
														// alert(
														// 	"Error fetching tutoring presets. The database holding the presets might be out of requests, try again later."
														// );
														setTutoringPresets(tutoringEventsss.tutoringEvents);
														console.log("Used fallback tutoring presets");
													}
												}}
											/>
										</div>
										{eventIsTutoring ? (
											<>
												<div className={`${styles.eventInput} mb-1`}>
													<p>Event Presets</p>
													<select
														className={styles.eventInputHours}
														onChange={(e) => {
															let ee = e.target.value.split(",");
															setEventName(ee[0]);
															setEventLocation(ee[1]);
															setTutoringTeachers(ee[2]);
															setEventEndTime(ee[3]);
															setEventVolunteersNeeded(ee[4]);
														}}
													>
														{/* // map tutoringPresets */}
														{tutoringPresets.map((preset) => {
															return (
																<option
																	key={preset.subject}
																	value={[
																		preset.subject,
																		preset.room,
																		preset.teachers,
																		preset.endTime,
																		preset.tutorsNeeded,
																	]}
																>
																	{preset.subject} - {preset.teachers}
																</option>
															);
														})}
													</select>
												</div>
												<p>
													To edit the presets, modify{" "}
													<a
														href="https://extendsclass.com/jsonstorage/de5f28ec2add"
														className="hoverUnderlineAnim mb-1"
														target={"_blank"}
														rel="noreferrer"
													>
														this
													</a>
													, the key is {`"nhs"`}
												</p>
											</>
										) : (
											<></>
										)}
										<div className={`${styles.eventInput}`}>
											<p>{eventIsTutoring ? "Subject" : "Event Name"}</p>
											<input
												type="text"
												onChange={(e) => setEventName(e.target.value)}
												value={eventName}
											/>
										</div>
										<div className={`${styles.eventInput}`}>
											<p>Date</p>
											<input
												type="date"
												onChange={(e) => setEventDate(e.target.value)}
												value={eventDate}
											/>
										</div>
										<div className={`${styles.eventInput}`}>
											<p>{eventIsTutoring ? "Room" : "Location"}</p>
											<input
												type="text"
												onChange={(e) => setEventLocation(e.target.value)}
												value={eventLocation}
											/>
										</div>
										{eventIsTutoring ? (
											<div className={`${styles.eventInput}`}>
												<p>{"Teacher(s)"}</p>
												<input
													type="text"
													onChange={(e) => setTutoringTeachers(e.target.value)}
													value={tutoringTeachers}
												/>
											</div>
										) : (
											<></>
										)}
										{!eventIsTutoring ? (
											<div className={`${styles.eventInput}`}>
												<p>Start Time</p>
												<input
													type="text"
													onChange={(e) => setEventStartTime(e.target.value)}
													value={eventStartTime}
												/>
											</div>
										) : (
											<></>
										)}

										<div className={`${styles.eventInput}`}>
											<p>End Time</p>
											<input
												type="text"
												onChange={(e) => setEventEndTime(e.target.value)}
												value={eventEndTime}
											/>
										</div>
										<div
											className={`${styles.eventInput} ${
												!eventIsTutoring ? "mb-2" : ""
											}`}
										>
											<p>{eventIsTutoring ? "Tutors" : "Volunteers"} Needed</p>
											<input
												type="text"
												onChange={(e) =>
													setEventVolunteersNeeded(e.target.value)
												}
												value={eventVolunteersNeeded}
											/>
										</div>
										{eventIsTutoring ? (
											<div className={`${styles.eventInput} mb-2`}>
												<p>Tutoring Host</p>
												<input
													type="text"
													onChange={(e) => setTutoringHost(e.target.value)}
													value={tutoringHost}
												/>
											</div>
										) : (
											<></>
										)}

										<button
											className="ApproveButton-pushable mb-3"
											onClick={() => {
												addEventRefresh();
											}}
										>
											<span className="ApproveButton-shadow"></span>
											<span className="ApproveButton-edge"></span>

											<span className="ApproveButton-front text">
												Add Event
											</span>
										</button>
									</motion.div>
									<div className="col-12 col-lg-6 d-flex align-items-center flex-column">
										<h2 className="mb-1">Events</h2>
										<p className="mb-2">
											If an event is red, it is from the past
										</p>
										<div className="d-flex flex-row justify-content-center align-items-center mb-2">
											{!showTutoringEvents ? (
												<button
													className="ApproveButton-pushable me-2"
													onClick={(e) => {
														setShowTutoringEvents(false);
													}}
												>
													<span className="ApproveButton-shadow"></span>
													<span className="ApproveButton-edge"></span>

													<span className="ApproveButton-front text">
														Volunteer
													</span>
												</button>
											) : (
												<button
													className="DenyButton-pushable me-2"
													onClick={(e) => {
														setShowTutoringEvents(false);
													}}
												>
													<span className="DenyButton-shadow"></span>
													<span className="DenyButton-edge"></span>

													<span className="DenyButton-front text">
														Volunteer
													</span>
												</button>
											)}

											{showTutoringEvents ? (
												<button
													className="ApproveButton-pushable"
													onClick={(e) => {
														setShowTutoringEvents(true);
													}}
												>
													<span className="ApproveButton-shadow"></span>
													<span className="ApproveButton-edge"></span>

													<span className="ApproveButton-front text">
														Tutoring
													</span>
												</button>
											) : (
												<button
													className="DenyButton-pushable"
													onClick={(e) => {
														setShowTutoringEvents(true);
													}}
												>
													<span className="DenyButton-shadow"></span>
													<span className="DenyButton-edge"></span>

													<span className="DenyButton-front text">
														Tutoring
													</span>
												</button>
											)}
										</div>
										<Table
											minHeight={"20vh"}
											maxHeight={"80vh"}
											bgColor={"rgba(0,0,0,0.2)"}
											useArrow
										>
											{showTutoringEvents ? (
												events.events.length > 0 ? (
													events.events
														.filter((eventt) => eventt.isTutoring)
														.map((event: eventProps) => {
															const isEventOld: boolean =
																new Date(
																	parseInt(event.date.split("-")[0]),
																	parseInt(event.date.split("-")[1]) - 1,
																	parseInt(event.date.split("-")[2])
																).getTime() >=
																new Date().getTime() - 86400000;
															return (
																<div
																	className={`${styles.eventsItem}`}
																	key={
																		"event" +
																		events.events.indexOf(event as never)
																	}
																>
																	<div className="d-flex align-items-center justify-content-center flex-row w-100 flex-wrap">
																		<Collapsable
																			initText={
																				event.eventName + " - " + event.date
																			}
																			className={`w-100 ${
																				!isEventOld ? "bg-danger" : ""
																			}`}
																		>
																			<p>
																				<b>Date:</b> {event.date}
																			</p>
																			<p>
																				<b>Room:</b> {event.location}
																			</p>
																			<p>
																				<b>End Time:</b> {event.endTime}
																			</p>
																			<p>
																				<b>Teachers:</b> {event.teachers}
																			</p>
																			<p>
																				<b>Tutors Needed: </b>
																				{event.volunteersNeeded}
																			</p>
																			<p>
																				<b>Tutors: </b>
																				{event.volunteers}
																			</p>
																			<p>
																				<b>Host: </b>
																				{event.tutorHost}
																			</p>
																		</Collapsable>
																	</div>
																	<div
																		className="d-flex align-items-center justify-content-center flex-row"
																		id={`${styles.eventDeleteButtonDiv}`}
																	>
																		<button
																			className="DenyButton-pushable"
																			onClick={() => {
																				deleteEventRefresh(
																					event.eventName,
																					event.date
																				);
																			}}
																		>
																			<span className="DenyButton-shadow"></span>
																			<span className="DenyButton-edge"></span>

																			<span className="DenyButton-front text">
																				Delete
																			</span>
																		</button>
																	</div>
																</div>
															);
														})
												) : (
													<div className="d-flex align-items-center justify-content-center w-100">
														<label className={`${styles.noPending}`}>
															No events
														</label>
													</div>
												)
											) : events.events.length > 0 ? (
												events.events
													.filter((eventt) => !eventt.isTutoring)
													.map((event: eventProps) => {
														const isEventOld: boolean =
															new Date(
																parseInt(event.date.split("-")[0]),
																parseInt(event.date.split("-")[1]) - 1,
																parseInt(event.date.split("-")[2])
															).getTime() >=
															new Date().getTime() - 86400000;
														return (
															<div
																className={`${styles.eventsItem}`}
																key={
																	"event" +
																	events.events.indexOf(event as never)
																}
															>
																<div
																	className={`d-flex align-items-center justify-content-center flex-row w-100 flex-wrap }`}
																>
																	<Collapsable
																		initText={event.eventName}
																		className={`w-100 ${
																			!isEventOld ? "bg-danger" : ""
																		}`}
																	>
																		<p>
																			<b>Date:</b> {event.date}
																		</p>
																		<p>
																			<b>Location:</b> {event.location}
																		</p>
																		<p>
																			<b>Start Time:</b> {event.startTime}
																		</p>
																		<p>
																			<b>End Time:</b> {event.endTime}
																		</p>
																		<p>
																			<b>Volunteers Needed: </b>
																			{event.volunteersNeeded}
																		</p>
																	</Collapsable>
																</div>
																<div
																	className="d-flex align-items-center justify-content-center flex-row"
																	id={`${styles.eventDeleteButtonDiv}`}
																>
																	<button
																		className="DenyButton-pushable"
																		onClick={() => {
																			deleteEventRefresh(
																				event.eventName,
																				event.date
																			);
																		}}
																	>
																		<span className="DenyButton-shadow"></span>
																		<span className="DenyButton-edge"></span>

																		<span className="DenyButton-front text">
																			Delete
																		</span>
																	</button>
																</div>
															</div>
														);
													})
											) : (
												<div className="d-flex align-items-center justify-content-center w-100">
													<label className={`${styles.noPending}`}>
														No events
													</label>
												</div>
											)}
										</Table>
									</div>
								</div>
							</section>
							<section
								className={`${styles.adminSection} container-sm text-center`}
							>
								<div className="row">
									<div
										className="col-lg-6 d-flex align-items-center flex-column"
										id={`${styles.pendingMembers}`}
									>
										<h2>Hours Managment</h2>
										<p>
											New hours are <b>not</b> additive, it replaces the
											previous value. Ensure all hours are what the member
											should have after clicking submit. Values shown in the
											dropdown are the members current hours{" "}
										</p>
										<motion.div
											animate={secondControls}
											ref={secondRef}
											transition={{
												duration: 0.5,
												ease: [0.5, 0.01, -0.05, 0.9],
											}}
											initial={{ scale: 0 }}
											variants={{
												visible: { scale: 1 },
											}}
											className="w-100 d-flex align-items-center justify-content-center flex-column container"
										>
											<div
												className={`flex-md-row flex-column d-flex text-white ${styles.eventInputHours} align-items-center justify-content-center `}
											>
												<p className="pe-2">Member: </p>
												<select
													value={hoursName}
													onChange={(v) => setHoursName(v.target.value)}
												>
													<option value="Select a member">
														Select a member
													</option>
													{accounts.accounts
														.filter((e) => e.isVerified == true)
														.map((e) => (
															<option
																value={e.firstName + " " + e.lastName}
																key={accounts.accounts.indexOf(e) + "di"}
																onClick={() => {
																	setHoursNewTutoringHours(e.tutoringHours);
																	setHoursNewVolunteerHours(e.volunteerHours);
																}}
															>
																{e.firstName +
																	" " +
																	e.lastName +
																	" | Volunteer: " +
																	e.volunteerHours +
																	" Tutor: " +
																	e.tutoringHours}
															</option>
														))}
												</select>
											</div>

											<div className={`${styles.eventInput}`}>
												<p>New Volunteer Hours</p>
												<input
													type="number"
													onChange={(e) =>
														setHoursNewVolunteerHours(
															e.target.value as unknown as number
														)
													}
													value={hoursNewVolunteerHours as unknown as string}
												/>
											</div>
											<div className={`${styles.eventInput}`}>
												<p>New Tutoring Hours</p>
												<input
													type="number"
													onChange={(e) =>
														setHoursNewTutoringHours(
															e.target.value as unknown as number
														)
													}
													value={hoursNewTutoringHours as unknown as string}
												/>
											</div>
											<button
												className="ApproveButton-pushable mb-3"
												onClick={async () => {
													if (
														hoursName == "" ||
														hoursName.length <= 0 ||
														hoursName == "Select a member"
													) {
														alert("Please select a member");
														return;
													} else if (
														hoursNewVolunteerHours < 0 ||
														hoursNewTutoringHours < 0
													) {
														alert("Please enter a value for both fields");
														return;
													} else {
														updateMember(hoursName, {
															volunteerHours: hoursNewVolunteerHours,
															tutoringHours: hoursNewTutoringHours,
														}).then(() => {
															alert("Updated");
														});
													}
												}}
											>
												<span className="ApproveButton-shadow"></span>
												<span className="ApproveButton-edge"></span>

												<span className="ApproveButton-front text">Submit</span>
											</button>
										</motion.div>
									</div>
									<div
										className="col-lg-6 d-flex align-items-center flex-column"
										id={`${styles.pendingMembers}`}
									>
										<h2>Hour Requests</h2>
										<p>
											Members send requests that require approval before their
											event hours get added to their account. View them here.
										</p>
										<motion.div
											animate={secondControls}
											ref={secondRef}
											transition={{
												duration: 0.5,
												ease: [0.5, 0.01, -0.05, 0.9],
											}}
											initial={{ scale: 0 }}
											variants={{
												visible: { scale: 1 },
											}}
											className="w-100 d-flex align-items-center justify-content-center flex-column container"
										>
											<Table maxHeight={"80vh"} minHeight={"20vh"} useArrow>
												{hourRequests.length > 0 ? (
													<>
														{hourRequests.map((request, index) => {
															return (
																<div
																	key={index}
																	className={`${styles.pendingMember} w-100`}
																>
																	<div className="d-flex justify-content-between w-100 flex-row">
																		<div className={`${styles.MemberItemText}`}>
																			<Collapsable
																				initText={
																					request.name +
																					" - " +
																					request.eventName
																				}
																				className={`w-100 ${styles.memberItemThing}`}
																			>
																				<div className="d-flex flex-column">
																					<p className="mb-0">
																						<b>Arrival: </b>
																						{request.arriveTime}
																					</p>
																					<p className="mb-0">
																						<b>Departure: </b>
																						{request.leaveTime}
																					</p>
																					{(request.addTutoringHours as unknown as string) ==
																						"0" ||
																					request.addTutoringHours == 0 ? (
																						<p className="mb-0">
																							<b>Volunteer Hours: </b>
																							{request.addVolunteerHours}
																						</p>
																					) : (
																						<p className="mb-0">
																							<b>Tutoring Hours: </b>
																							{request.addTutoringHours}
																						</p>
																					)}
																				</div>
																			</Collapsable>
																		</div>
																		<div
																			className="d-flex align-items-center justify-content-center flex-row"
																			id={`${styles.eventDeleteButtonDiv}`}
																		>
																			<button
																				className="ApproveButton-pushable me-md-2 me-1"
																				onClick={async () => {
																					await approveHoursRequest(
																						request.name,
																						request.eventName
																					);
																					setHourRequests(
																						hourRequests.filter(
																							(r) =>
																								r.eventName !=
																									request.eventName &&
																								r.name != request.name
																						)
																					);
																					await getHourRequests().then(
																						(res) => {
																							setHourRequests(res);
																						}
																					);
																					// console.log(hourRequests);
																				}}
																			>
																				<span className="ApproveButton-shadow"></span>
																				<span className="ApproveButton-edge"></span>

																				<span className="ApproveButton-front text">
																					Approve
																				</span>
																			</button>
																			<button
																				className="DenyButton-pushable"
																				onClick={async () => {
																					await denyHoursRequest(
																						request.name,
																						request.eventName
																					);
																					setHourRequests(
																						hourRequests.filter(
																							(r) =>
																								r.eventName !=
																									request.eventName &&
																								r.name != request.name
																						)
																					);
																					await getHourRequests().then(
																						(res) => {
																							setHourRequests(res);
																						}
																					);
																					// console.log(hourRequests);
																				}}
																			>
																				<span className="DenyButton-shadow"></span>
																				<span className="DenyButton-edge"></span>

																				<span className="DenyButton-front text">
																					Deny
																				</span>
																			</button>
																		</div>
																	</div>
																</div>
															);
														})}
													</>
												) : (
													<div className="w-100 d-flex justify-content-center align-items-center">
														<p className="text-center">
															<b>No requests to show</b>
														</p>
													</div>
												)}
											</Table>
										</motion.div>
									</div>
								</div>
							</section>
							<section
								className={`${styles.adminSection} container-sm text-center`}
							>
								<div className="row justify-content-center"></div>
							</section>
						</div>
					</motion.div>
				) : (
					<>
						{showLoading ? (
							<div className="w-100 vh-100 d-flex justify-content-center align-items-center flex-column">
								<div
									className="snake position-relative"
									id={styles.snake}
								></div>
							</div>
						) : (
							<div className="w-100 vh-100 d-flex align-items-center justify-content-center flex-column">
								<h1>Sign in</h1>
								<input
									type="email"
									placeholder="Email"
									className={`${styles.passInput}`}
									onChange={(e) => setEmail(e.target.value)}
								/>
								<input
									type="password"
									placeholder="Password"
									className={`${styles.passInput}`}
									onChange={(e) => setPassword(e.target.value)}
								/>

								<button
									className="LoadButton-pushable my-2"
									onClick={() => {
										adminButtonClicked({ email, password });
									}}
								>
									<span className="LoadButton-shadow"></span>
									<span className="LoadButton-edge"></span>
									<span className="LoadButton-front text">Login</span>
								</button>
							</div>
						)}
					</>
				)}
			</main>
		</SecLayout>
	);
}
