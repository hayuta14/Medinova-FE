import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // TODO: Replace with your actual backend API call
    // Example:
    // const response = await fetch('YOUR_BACKEND_API_URL/medical-history', {
    //   method: 'GET',
    //   headers: {
    //     'Authorization': `Bearer ${token}`,
    //     'Content-Type': 'application/json',
    //   },
    // });
    // const data = await response.json();
    // return NextResponse.json(data);

    // For now, return sample data (replace with actual backend integration)
    return NextResponse.json(
      {
        history: [
          // Sample data - remove this when connecting to real backend
          // {
          //   date: '2024-01-15',
          //   doctor: 'Dr. John Smith',
          //   department: 'Cardiology',
          //   diagnosis: 'Regular checkup, all vitals normal',
          //   prescription: 'Continue current medication',
          //   notes: 'Patient is in good health. Follow up in 3 months.',
          // },
        ],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Medical history error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

