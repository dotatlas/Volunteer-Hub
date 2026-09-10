// Imports
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import Script from "next/script";
import Confetti from "react-confetti";
import { useRef, useState } from "react";

import { newAccount } from "../goApi";

import { motion, AnimatePresence } from "framer-motion";

// CSS imports
import styles from "../styles/pages/CreateAccount.module.css";

// Component imports
import PageTitle from "../components/parts/PageTitle";
import Laser from "../components/funny/Laser";
import Gifs from "../components/funny/Gifs";
import SecLayout from "../components/_seclayout";

// Page
export default function CreateAccount() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [grade, setGrade] = useState("");
	const [isConfettiExploding, setIsConfettiExploding] = useState(false);
	const [isLaserRunning, setIsLaserRunning] = useState(false);
	const [isGifRunning, setIsGifRunning] = useState(false);

	const setFunny = (para: boolean) => {
		setIsConfettiExploding(para);
		setIsLaserRunning(para);
		setIsGifRunning(para);
	};

	let allInputs: Array<string | number> = [
		email,
		password,
		firstName,
		lastName,
		grade,
	];

	return (
		<SecLayout>
			{/* Meta tags */}
			<Head>
				<title>Lyman NHS</title>
				<link
					rel="canonical"
					href="https://lymannhs.netlify.app/createprofile"
				/>
			</Head>

			{isConfettiExploding ? (
				<div
					className="overflow-hidden vw-100 vh-100 position-fixed top-0 left-0 pointer-event-none"
					style={{ zIndex: 3000 }}
				>
					<Confetti
						width={window.innerWidth}
						height={window.innerHeight}
						numberOfPieces={100}
						onConfettiComplete={() => {
							setFunny(false);
						}}
						run={isConfettiExploding}
						tweenDuration={1000}
					/>
					 <Laser />
					<Gifs />
					<div
						className="d-flex w-100 justify-content-center align-items-center position-absolute top-0 left-0"
						id={styles.discoball}
					>
						<Image
							src={"/img/discoball.jpg"}
							alt=""
							width={"100"}
							height={"150"}
						/>
					</div>
				</div>
			) : (
				<> </>
			)}

			{/* ! Main homepage content */}
			<main>
				{/* <PageTitle title="Create Account"></PageTitle> */}
				<div id={`${styles.notTitle}`}>
					<div id={`${styles.loginBg}`}>
						<Image src={"/img/campus.jpg"} fill alt="" />
					</div>
					<AnimatePresence>
						<section id={`${styles.loginModal}`}>
							<h1>Create Profile</h1>
							<div id={`${styles.loginForm}`}>
								<h2>Profile info</h2>
								<div className={`${styles.loginInput}`}>
									<p>Email</p>
									<input
										type="email"
										onChange={(e) => setEmail(e.target.value.trim())}
										value={email}
									/>
								</div>
								<div className={`${styles.loginInput}`}>
									<p>Password</p>
									<input
										type="text"
										onChange={(e) => setPassword(e.target.value.trim())}
										value={password}
									/>
								</div>

								<h2>Other</h2>
								<div className={`${styles.loginInput}`}>
									<p>First Name</p>
									<input
										type="text"
										value={firstName}
										onChange={(e) => setFirstName(e.target.value.trim())}
									/>
								</div>
								<div className={`${styles.loginInput}`}>
									<p>Last Name</p>
									<input
										type="text"
										value={lastName}
										onChange={(e) => setLastName(e.target.value.trim())}
									/>
								</div>
								<div className={`${styles.loginInput}`}>
									<p>Grade</p>
									<input
										type="number"
										min="9"
										max="12"
										value={grade}
										onChange={(e) => setGrade(e.target.value.trim())}
									/>
								</div>
								<div className={`${styles.loginButton}`}>
									<button
										className="LoadButton-pushable my-3"
										onClick={() => {
											newAccount({
												email: email,
												password: password,
												firstName: firstName,
												lastName: lastName,
												grade: grade,
												isAdmin: false,
												isVerified: false,
												volunteerHours: 0,
												tutoringHours: 0,
											}).then((res) => {
												if (res) {
													setFunny(true);
													setTimeout(() => {
														setFunny(false);
													}, 8000);
												}
											});
										}}
									>
										<span className="LoadButton-shadow"></span>
										<span className="LoadButton-edge"></span>

										<span className="LoadButton-front text">
											Create Profile
										</span>
									</button>
								</div>
								<p
									className="hoverUnderlineAnim pe-auto"
									onClick={() => {
										alert(
											"make a new account, dont email me. we'll verify you again. just re-request your hours otherwise do it again"
										);
									}}
								>
									Forgot Password?
								</p>
							</div>
						</section>
					</AnimatePresence>
				</div>
			</main>
		</SecLayout>
	);
}
