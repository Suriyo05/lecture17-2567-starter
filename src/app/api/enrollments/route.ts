import { DB } from "@lib/DB";
import { zEnrollmentGetParam, zEnrollmentPostBody } from "@lib/schema";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (request:NextRequest) => {
  const studentId = request.nextUrl.searchParams.get("studentId");

  //validate input
  const parseResult = zEnrollmentGetParam.safeParse({
    studentId,
  });
  if (parseResult.success === false) {
    return NextResponse.json(
      {
        ok: false,
        message: parseResult.error.issues[0].message,
      },
      { status: 400 }
    );
  }


  //search enrollments array for items with 'studentId'
  const courseNoList = [];
  for(const enroll of DB.enrollments){
    if(enroll.studentId === studentId){ {
      courseNoList.push(enroll.courseNo);
    }

  }

  //given each found courseNo,search courses DB
  const courses = [];
  for(const courseNo of courseNoList){


    const found_course = DB.courses.find((c)=>c.courseNo === courseNo)
    if(!found_course)return NextResponse.json({
      ok: false,
      
      message: 'Oops! Something went wrong'
    }, {status:500})
    courses.push(found_course);
  
  }

  return NextResponse.json({
    ok: true,
    
    courses: courses,
  });
};
}

export const POST = async (request:NextRequest) => {
  
  
  
  const body = await request.json(); //การดึงดาต้าออกจากบอดี้
  const parseResult = zEnrollmentPostBody.safeParse(body);
  if (parseResult.success === false) {
    return NextResponse.json(
      {
        ok: false,
        message: parseResult.error.issues[0].message,
      },
      { status: 400 }
    );
  }

  const { studentId, courseNo } = body;

  const found_student = DB.students.find((s)=>s.studentId === studentId);
  const found_course = DB.courses.find((c)=>c.courseNo === courseNo)

  if(!found_student||found_course){
    return NextResponse.json({
      ok: false,
      message: 'Student or course not found',
    }, {status: 400})
  }
   
  const found_enroll = DB.enrollments.find(
    (enroll)=> enroll.courseNo === courseNo && enroll.studentId === studentId
  );
  if(found_enroll){
    return NextResponse.json({
      ok: false,
      message: 'Student already enrolled that course',
    }, {status: 400})
  }

  DB.enrollments.push({
    studentId,
    courseNo,
  });

  // return NextResponse.json(
  //   {
  //     ok: false,
  //     message: "Student Id or Course No is not existed",
  //   },
  //   { status: 400 }
  // );

  // return NextResponse.json(
  //   {
  //     ok: false,
  //     message: "Student already enrolled that course",
  //   },
  //   { status: 400 }
  // );

  //save in db

  return NextResponse.json({
    ok: true,
    message: "Student has enrolled course",
  });
};

