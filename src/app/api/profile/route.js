import { API_URL } from "@/utils/constants";
import { refreshToken } from "@/utils/refreshTokens";
import { log } from "console";
import { getTranslations } from "next-intl/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request) {
  const t = await getTranslations();
  const cookieStore = await cookies();
  let token = cookieStore.get("token")?.value;
  let userType = cookieStore.get("user_type")?.value;

  if (!token) {
    return NextResponse.json(
      { message: t("noUserLoggedIn") },
      { status: 401 }
    );
  }
  const fetchProfile = async (accessToken) => {
    return fetch(
      `${API_URL}/${userType === "user" ? "client" : "company"}/auth/profile`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
  };

  let res = await fetchProfile(token);

  if (res.status === 401) {
    const newTokenData = await refreshToken();
    if (!newTokenData?.token) {
      cookieStore.delete("token");
      return NextResponse.json({ message: t("unauthorized") }, { status: 401 });
    }
    token = newTokenData.token;
    cookieStore.set("token", token, {
      path: "/",
      expires: newTokenData.expires
        ? new Date(newTokenData.expires)
        : undefined,
      httpOnly: true,
      sameSite: "lax",
    });

    res = await fetchProfile(token);
  }

  if (!res.ok) {
    return NextResponse.json(
      { message: t("somethingWentWrong") },
      { status: res.status }
    );
  }

  const data = await res.json();
  return NextResponse.json({ user: data?.data, token }, { status: 200 });
}
