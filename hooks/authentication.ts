import { getAuth, onAuthStateChanged, signInAnonymously } from "firebase/auth";
import { useEffect } from "react";
import { atom, useRecoilState } from "recoil";
import { User } from "../models/User";
import { getFirestore, collection, doc, getDoc, setDoc } from "firebase/firestore";

const userState = atom<User>({
  key: "user",
  default: null,
});

async function createUserIfNotFound(user: User) {
  const db = getFirestore();
  const userCollection = collection(db, "users");
  const userRef = doc(userCollection, user.uid);
  const document = await getDoc(userRef);
  if (document.exists()) {
    return;
  }

  await setDoc(userRef, {
    name: "taro" + new Date().getTime(),
  });
}

export function useAuthentication() {
  const [user, setUser] = useRecoilState(userState);

  useEffect(() => {
    if (user !== null) {
      return;
    }

    const auth = getAuth();

    signInAnonymously(auth).catch(function (error) {
      // Handle Errors here.
      console.error(error);
    });

    onAuthStateChanged(auth, function (firebaseUser) {
      if (firebaseUser) {
        const loginUser: User = {
          uid: firebaseUser.uid,
          isAnonymous: firebaseUser.isAnonymous,
          name: "",
        };
        setUser(loginUser);
        createUserIfNotFound(loginUser);
      } else {
        // User is signed out.
        setUser(null);
      }
    });
  }, []);

  return { user };
}
