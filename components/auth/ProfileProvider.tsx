"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

import { supabase } from "@/lib/supabase";
import { useAuth } from "./AuthProvider";

interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  role: string;
}

interface ProfileContextType {
  profile: Profile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType>({
  profile: null,
  loading: true,
  refreshProfile: async () => {},
});

export function ProfileProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { user } = useAuth();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  async function refreshProfile() {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from("profiles")
      .select("id, first_name, last_name, role")
      .eq("id", user.id)
      .single();

    setProfile(data ?? null);
    setLoading(false);
  }

  useEffect(() => {
    refreshProfile();
  }, [user]);

  return (
    <ProfileContext.Provider
      value={{
        profile,
        loading,
        refreshProfile,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  return useContext(ProfileContext);
}