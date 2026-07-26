"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import Image from "next/image";
import Link from "next/link";

type User = {
  email: string;
  joinedDate: string;
  addressLine1?: string;
};

export default function Page() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const router = useRouter();

  useEffect(() => {
    // Make a GET request to fetch current user info
    const fetchUser = async () => {
      // User sign in?
      const res = await fetch("/api/me");
      // N:
      if (!res.ok) {
        router.push("/sign-in");
        return;
      }
      // Y:
      const data = await res.json();

      setCurrentUser(data);
    };

    fetchUser();
  }, [router]);

  if (!currentUser) {
    return (
      <main className={styles.centeredPage}>
        <p className={styles.loadingMessage}>Please sign in...</p>
      </main>
    );
  }

  const joinedDate = new Date(currentUser.joinedDate).toLocaleDateString(
    "en-CA",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    },
  );

  return (
    <main className={styles.main}>
      <h1>Your Account</h1>
      <div className={styles.userInfoContainer}>
        <Image
          src='/images/profile-picture.png'
          alt='default user profile picture'
          width={200}
          height={200}
        />
        <div className={styles.group}>
          <p>Email: {currentUser.email}</p>
          <p>Member Since: {joinedDate}</p>
          <p>
            Address: {currentUser.addressLine1 && `${currentUser.addressLine1}`}
          </p>
          <div className={styles.links}>
            <Link href='/account/addresses'>
              {currentUser.addressLine1 ? "Edit Address" : "Add Address"}
            </Link>
            <Link href='/orders'>View Orders (Coming Soon)</Link>
          </div>
        </div>
      </div>
      <div className={styles.buttonContainer}>
        <button
          type='submit'
          className={`${styles.button} ${styles.primaryButton}`}
        >
          Sign Out (Coming Soon)
        </button>
        <button
          type='submit'
          className={`${styles.button} ${styles.secondaryButton}`}
        >
          Change Password (Coming Soon)
        </button>
      </div>
    </main>
  );
}
