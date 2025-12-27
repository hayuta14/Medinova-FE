import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, fullName, phone } = body;

    // Validation
    if (!email || !password || !fullName) {
      return NextResponse.json(
        { message: 'Email, password, and full name are required' },
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

    // Password validation
    if (password.length < 6) {
      return NextResponse.json(
        { message: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // TODO: Replace with your actual backend API call
    // Example:
    // const response = await fetch('YOUR_BACKEND_API_URL/auth/register', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ email, password, fullName, phone }),
    // });
    // const data = await response.json();
    // return NextResponse.json(data);

    // For now, return success (replace with actual backend integration)
    return NextResponse.json(
      {
        message: 'Registration successful',
        user: {
          email,
          fullName,
          phone: phone || null,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

