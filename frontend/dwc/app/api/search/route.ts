import axios from 'axios';
import { NextResponse, NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  let result;
  const searchParam = req.nextUrl.searchParams.get('search');

  try {
    const response = await axios.get(`https://en.wikipedia.org/w/api.php?action=query&format=json&list=search&utf8=1&formatversion=1&srsearch=${searchParam}&srqiprofile=classic&srlimit=5`);
    result = response.data;
  } catch (error) {
    console.error(error);
    result = { message: 'Something went wrong.' };
  }

  return NextResponse.json(result);
}