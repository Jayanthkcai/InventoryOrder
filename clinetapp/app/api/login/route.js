export async function POST(req) {
  try {
    const { email, password } = await req.json();
    console.log(email);
    console.log(password);
    console.log("API URL is", process.env.API_GATEWAY_URL + "authlogin/login");

    // Call the API Gateway endpoint
    const response = await fetch(
      process.env.API_GATEWAY_URL + "authlogin/login",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email, password: password }),
      }
    );
    console.log(response.status);

    const data = await response.json();
    if (!response.ok) {
      return Response.json(
        { error: data.error || "Login failed" },
        { status: response.status }
      );
    }

    return Response.json(data, { status: 200 }); // Success response
  } catch (error) {
    console.error("Error logging in:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET() {
  return Response.json({ message: "Method Not Allowed" }, { status: 405 });
}
