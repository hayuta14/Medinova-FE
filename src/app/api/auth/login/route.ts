import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: 'Invalid email format' },
        { status: 400 }
      );
    }

    // TODO: Replace with your actual backend API call
    // Example:
    // const response = await fetch('YOUR_BACKEND_API_URL/auth/login', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ email, password }),
    // });
    // const data = await response.json();
    // 
    // Backend should return: { token: 'jwt-token', user: {...} }
    // or: { accessToken: 'jwt-token', user: {...} }
    // return NextResponse.json(data);

    // For now, return success (replace with actual backend integration)
    // The token will be saved to localStorage in the frontend
    return NextResponse.json(
      {
        message: 'Login successful',
        token: 'dummy-jwt-token-' + Date.now(), // Replace with actual JWT token from backend
        user: {
          email,
          id: '1', // Replace with actual user ID from backend
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

