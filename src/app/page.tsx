import Image from "next/image";
import Link from "next/link";
import Topbar from "@/components/Topbar";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackToTop from "@/components/BackToTop";
import AppointmentForm from "@/components/AppointmentForm";

export default function Home() {
  return (
    <>
      <Navbar />

      {/* Hero Start */}
      <div className="container-fluid bg-primary py-5 mb-5 hero-header">
        <div className="container py-5">
          <div className="row justify-content-start">
            <div className="col-lg-8 text-center text-lg-start">
              <h5
                className="d-inline-block text-primary text-uppercase border-bottom border-5"
                style={{ borderColor: "rgba(256, 256, 256, .3) !important" }}
              >
                Welcome To Medinova
              </h5>
              <h1 className="display-1 text-white mb-md-4">
                Best Healthcare Solution In Your City
              </h1>
              <div className="pt-2">
                <a
                  href="/search"
                  className="btn btn-light rounded-pill py-md-3 px-md-5 mx-2"
                >
                  Find Doctor
                </a>
                <a
                  href="/appointment"
                  className="btn btn-outline-light rounded-pill py-md-3 px-md-5 mx-2"
                >
                  Appointment
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Hero End */}

      {/* About Start */}
      <div className="container-fluid py-5">
        <div className="container">
          <div className="row gx-5">
            <div
              className="col-lg-5 mb-5 mb-lg-0"
              style={{ minHeight: "500px" }}
            >
              <div className="position-relative h-100">
                <Image
                  src="/img/about.jpg"
                  alt="About"
                  fill
                  className="position-absolute w-100 h-100 rounded"
                  style={{ objectFit: "cover" }}
                />
              </div>
            </div>
            <div className="col-lg-7">
              <div className="mb-4">
                <h5 className="d-inline-block text-primary text-uppercase border-bottom border-5">
                  About Us
                </h5>
                <h1 className="display-4">
                  Best Medical Care For Yourself and Your Family
                </h1>
              </div>
              <p>
                Tempor erat elitr at rebum at at clita aliquyam consetetur. Diam
                dolor diam ipsum et, tempor voluptua sit consetetur sit.
                Aliquyam diam amet diam et eos sadipscing labore. Clita erat
                ipsum et lorem et sit, sed stet no labore lorem sit. Sanctus
                clita duo justo et tempor consetetur takimata eirmod, dolores
                takimata consetetur invidunt magna dolores aliquyam dolores
                dolore. Amet erat amet et magna
              </p>
              <div className="row g-3 pt-3">
                <div className="col-sm-3 col-6">
                  <div className="bg-light text-center rounded-circle py-4">
                    <i className="fa fa-3x fa-user-md text-primary mb-3"></i>
                    <h6 className="mb-0">
                      Qualified
                      <small className="d-block text-primary">Doctors</small>
                    </h6>
                  </div>
                </div>
                <div className="col-sm-3 col-6">
                  <div className="bg-light text-center rounded-circle py-4">
                    <i className="fa fa-3x fa-procedures text-primary mb-3"></i>
                    <h6 className="mb-0">
                      Emergency
                      <small className="d-block text-primary">Services</small>
                    </h6>
                  </div>
                </div>
                <div className="col-sm-3 col-6">
                  <div className="bg-light text-center rounded-circle py-4">
                    <i className="fa fa-3x fa-microscope text-primary mb-3"></i>
                    <h6 className="mb-0">
                      Accurate
                      <small className="d-block text-primary">Testing</small>
                    </h6>
                  </div>
                </div>
                <div className="col-sm-3 col-6">
                  <div className="bg-light text-center rounded-circle py-4">
                    <i className="fa fa-3x fa-ambulance text-primary mb-3"></i>
                    <h6 className="mb-0">
                      Free
                      <small className="d-block text-primary">Ambulance</small>
                    </h6>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* About End */}

      {/* Services Start */}
      <div className="container-fluid py-5">
        <div className="container">
          <div
            className="text-center mx-auto mb-5"
            style={{ maxWidth: "500px" }}
          >
            <h5 className="d-inline-block text-primary text-uppercase border-bottom border-5">
              Services
            </h5>
            <h1 className="display-4">Excellent Medical Services</h1>
          </div>
          <div className="row g-5">
            <div className="col-lg-4 col-md-6">
              <div className="service-item bg-light rounded d-flex flex-column align-items-center justify-content-center text-center">
                <div className="service-icon mb-4">
                  <i className="fa fa-2x fa-user-md text-white"></i>
                </div>
                <h4 className="mb-3">Emergency Care</h4>
                <p className="m-0"></p>
                <a className="btn btn-lg btn-primary rounded-pill" href="#!">
                  <i className="bi bi-arrow-right"></i>
                </a>
              </div>
            </div>
            <div className="col-lg-4 col-md-6">
              <div className="service-item bg-light rounded d-flex flex-column align-items-center justify-content-center text-center">
                <div className="service-icon mb-4">
                  <i className="fa fa-2x fa-procedures text-white"></i>
                </div>
                <h4 className="mb-3">Operation & Surgery</h4>
                <p className="m-0"></p>
                <a className="btn btn-lg btn-primary rounded-pill" href="#!">
                  <i className="bi bi-arrow-right"></i>
                </a>
              </div>
            </div>
            <div className="col-lg-4 col-md-6">
              <div className="service-item bg-light rounded d-flex flex-column align-items-center justify-content-center text-center">
                <div className="service-icon mb-4">
                  <i className="fa fa-2x fa-stethoscope text-white"></i>
                </div>
                <h4 className="mb-3">Outdoor Checkup</h4>
                <p className="m-0"></p>
                <a className="btn btn-lg btn-primary rounded-pill" href="#!">
                  <i className="bi bi-arrow-right"></i>
                </a>
              </div>
            </div>
            <div className="col-lg-4 col-md-6">
              <div className="service-item bg-light rounded d-flex flex-column align-items-center justify-content-center text-center">
                <div className="service-icon mb-4">
                  <i className="fa fa-2x fa-ambulance text-white"></i>
                </div>
                <h4 className="mb-3">Ambulance Service</h4>
                <p className="m-0"></p>
                <a className="btn btn-lg btn-primary rounded-pill" href="#!">
                  <i className="bi bi-arrow-right"></i>
                </a>
              </div>
            </div>
            <div className="col-lg-4 col-md-6">
              <div className="service-item bg-light rounded d-flex flex-column align-items-center justify-content-center text-center">
                <div className="service-icon mb-4">
                  <i className="fa fa-2x fa-pills text-white"></i>
                </div>
                <h4 className="mb-3">Medicine & Pharmacy</h4>
                <p className="m-0"></p>
                <a className="btn btn-lg btn-primary rounded-pill" href="#!">
                  <i className="bi bi-arrow-right"></i>
                </a>
              </div>
            </div>
            <div className="col-lg-4 col-md-6">
              <div className="service-item bg-light rounded d-flex flex-column align-items-center justify-content-center text-center">
                <div className="service-icon mb-4">
                  <i className="fa fa-2x fa-microscope text-white"></i>
                </div>
                <h4 className="mb-3">Blood Testing</h4>
                <p className="m-0"></p>
                <a className="btn btn-lg btn-primary rounded-pill" href="#!">
                  <i className="bi bi-arrow-right"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Services End */}

      {/* Appointment Start */}
      <div className="container-fluid bg-primary my-5 py-5">
        <div className="container py-5">
          <div className="row gx-5">
            <div className="col-lg-6 mb-5 mb-lg-0">
              <div className="mb-4">
                <h5 className="d-inline-block text-white text-uppercase border-bottom border-5">
                  Appointment
                </h5>
                <h1 className="display-4">
                  Make An Appointment For Your Family
                </h1>
              </div>
              <p className="text-white mb-5">
                Eirmod sed tempor lorem ut dolores. Aliquyam sit sadipscing kasd
                ipsum. Dolor ea et dolore et at sea ea at dolor, justo ipsum duo
                rebum sea invidunt voluptua. Eos vero eos vero ea et dolore
                eirmod et. Dolores diam duo invidunt lorem. Elitr ut dolores
                magna sit. Sea dolore sanctus sed et. Takimata takimata sanctus
                sed.
              </p>
              <a
                className="btn btn-dark rounded-pill py-3 px-5 me-3"
                href="/search"
              >
                Find Doctor
              </a>
              <a
                className="btn btn-outline-dark rounded-pill py-3 px-5"
                href="#!"
              >
                Read More
              </a>
            </div>
            <div className="col-lg-6">
              <AppointmentForm bgColor="bg-white" textColor="bg-light" />
            </div>
          </div>
        </div>
      </div>
      {/* Appointment End */}

      {/* Pricing Plan Start */}
      <div className="container-fluid py-5">
        <div className="container">
          <div
            className="text-center mx-auto mb-5"
            style={{ maxWidth: "500px" }}
          >
            <h5 className="d-inline-block text-primary text-uppercase border-bottom border-5">
              Medical Packages
            </h5>
            <h1 className="display-4">Awesome Medical Programs</h1>
          </div>
          <div
            className="owl-carousel price-carousel position-relative"
            style={{ padding: "0 45px 45px 45px" }}
          >
            <div className="bg-light rounded text-center">
              <div className="position-relative">
                <Image
                  src="/img/price-1.jpg"
                  alt="Pregnancy Care"
                  width={400}
                  height={300}
                  className="img-fluid rounded-top"
                />
                <div
                  className="position-absolute w-100 h-100 top-50 start-50 translate-middle rounded-top d-flex flex-column align-items-center justify-content-center"
                  style={{ background: "rgba(29, 42, 77, .8)" }}
                >
                  <h3 className="text-white">Pregnancy Care</h3>
                  <h1 className="display-4 text-white mb-0">
                    <small
                      className="align-top fw-normal"
                      style={{ fontSize: "22px", lineHeight: "45px" }}
                    >
                      $
                    </small>
                    49
                    <small
                      className="align-bottom fw-normal"
                      style={{ fontSize: "16px", lineHeight: "40px" }}
                    >
                      / Year
                    </small>
                  </h1>
                </div>
              </div>
              <div className="text-center py-5">
                <p>Emergency Medical Treatment</p>
                <p>Highly Experienced Doctors</p>
                <p>Highest Success Rate</p>
                <p>Telephone Service</p>
                <a
                  href="#!"
                  className="btn btn-primary rounded-pill py-3 px-5 my-2"
                >
                  Apply Now
                </a>
              </div>
            </div>
            <div className="bg-light rounded text-center">
              <div className="position-relative">
                <Image
                  src="/img/price-2.jpg"
                  alt="Health Checkup"
                  width={400}
                  height={300}
                  className="img-fluid rounded-top"
                />
                <div
                  className="position-absolute w-100 h-100 top-50 start-50 translate-middle rounded-top d-flex flex-column align-items-center justify-content-center"
                  style={{ background: "rgba(29, 42, 77, .8)" }}
                >
                  <h3 className="text-white">Health Checkup</h3>
                  <h1 className="display-4 text-white mb-0">
                    <small
                      className="align-top fw-normal"
                      style={{ fontSize: "22px", lineHeight: "45px" }}
                    >
                      $
                    </small>
                    99
                    <small
                      className="align-bottom fw-normal"
                      style={{ fontSize: "16px", lineHeight: "40px" }}
                    >
                      / Year
                    </small>
                  </h1>
                </div>
              </div>
              <div className="text-center py-5">
                <p>Emergency Medical Treatment</p>
                <p>Highly Experienced Doctors</p>
                <p>Highest Success Rate</p>
                <p>Telephone Service</p>
                <a
                  href="#!"
                  className="btn btn-primary rounded-pill py-3 px-5 my-2"
                >
                  Apply Now
                </a>
              </div>
            </div>
            <div className="bg-light rounded text-center">
              <div className="position-relative">
                <Image
                  src="/img/price-3.jpg"
                  alt="Dental Care"
                  width={400}
                  height={300}
                  className="img-fluid rounded-top"
                />
                <div
                  className="position-absolute w-100 h-100 top-50 start-50 translate-middle rounded-top d-flex flex-column align-items-center justify-content-center"
                  style={{ background: "rgba(29, 42, 77, .8)" }}
                >
                  <h3 className="text-white">Dental Care</h3>
                  <h1 className="display-4 text-white mb-0">
                    <small
                      className="align-top fw-normal"
                      style={{ fontSize: "22px", lineHeight: "45px" }}
                    >
                      $
                    </small>
                    149
                    <small
                      className="align-bottom fw-normal"
                      style={{ fontSize: "16px", lineHeight: "40px" }}
                    >
                      / Year
                    </small>
                  </h1>
                </div>
              </div>
              <div className="text-center py-5">
                <p>Emergency Medical Treatment</p>
                <p>Highly Experienced Doctors</p>
                <p>Highest Success Rate</p>
                <p>Telephone Service</p>
                <a
                  href="#!"
                  className="btn btn-primary rounded-pill py-3 px-5 my-2"
                >
                  Apply Now
                </a>
              </div>
            </div>
            <div className="bg-light rounded text-center">
              <div className="position-relative">
                <Image
                  src="/img/price-4.jpg"
                  alt="Operation & Surgery"
                  width={400}
                  height={300}
                  className="img-fluid rounded-top"
                />
                <div
                  className="position-absolute w-100 h-100 top-50 start-50 translate-middle rounded-top d-flex flex-column align-items-center justify-content-center"
                  style={{ background: "rgba(29, 42, 77, .8)" }}
                >
                  <h3 className="text-white">Operation & Surgery</h3>
                  <h1 className="display-4 text-white mb-0">
                    <small
                      className="align-top fw-normal"
                      style={{ fontSize: "22px", lineHeight: "45px" }}
                    >
                      $
                    </small>
                    199
                    <small
                      className="align-bottom fw-normal"
                      style={{ fontSize: "16px", lineHeight: "40px" }}
                    >
                      / Year
                    </small>
                  </h1>
                </div>
              </div>
              <div className="text-center py-5">
                <p>Emergency Medical Treatment</p>
                <p>Highly Experienced Doctors</p>
                <p>Highest Success Rate</p>
                <p>Telephone Service</p>
                <a
                  href="#!"
                  className="btn btn-primary rounded-pill py-3 px-5 my-2"
                >
                  Apply Now
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Pricing Plan End */}

      {/* Team Start */}
      <div className="container-fluid py-5">
        <div className="container">
          <div
            className="text-center mx-auto mb-5"
            style={{ maxWidth: "500px" }}
          >
            <h5 className="d-inline-block text-primary text-uppercase border-bottom border-5">
              Our Doctors
            </h5>
            <h1 className="display-4">Qualified Healthcare Professionals</h1>
          </div>
          <div className="owl-carousel team-carousel position-relative">
            <div className="team-item">
              <div className="row g-0 bg-light rounded overflow-hidden">
                <div className="col-12 col-sm-5 h-100">
                  <Image
                    src="/img/team-1.jpg"
                    alt="Doctor"
                    width={300}
                    height={350}
                    className="img-fluid h-100"
                    style={{ objectFit: "cover" }}
                  />
                </div>
                <div className="col-12 col-sm-7 h-100 d-flex flex-column">
                  <div className="mt-auto p-4">
                    <h3>Doctor Name</h3>
                    <h6 className="fw-normal fst-italic text-primary mb-4">
                      Cardiology Specialist
                    </h6>
                    <p className="m-0">
                      Dolor lorem eos dolor duo eirmod sea. Dolor sit magna
                      rebum clita rebum dolor
                    </p>
                  </div>
                  <div className="d-flex mt-auto border-top p-4">
                    <a
                      className="btn btn-lg btn-primary btn-lg-square rounded-circle me-3"
                      href="#!"
                    >
                      <i className="fab fa-twitter"></i>
                    </a>
                    <a
                      className="btn btn-lg btn-primary btn-lg-square rounded-circle me-3"
                      href="#!"
                    >
                      <i className="fab fa-facebook-f"></i>
                    </a>
                    <a
                      className="btn btn-lg btn-primary btn-lg-square rounded-circle"
                      href="#!"
                    >
                      <i className="fab fa-linkedin-in"></i>
                    </a>
                  </div>
                </div>
              </div>
            </div>
            <div className="team-item">
              <div className="row g-0 bg-light rounded overflow-hidden">
                <div className="col-12 col-sm-5 h-100">
                  <Image
                    src="/img/team-2.jpg"
                    alt="Doctor"
                    width={300}
                    height={350}
                    className="img-fluid h-100"
                    style={{ objectFit: "cover" }}
                  />
                </div>
                <div className="col-12 col-sm-7 h-100 d-flex flex-column">
                  <div className="mt-auto p-4">
                    <h3>Doctor Name</h3>
                    <h6 className="fw-normal fst-italic text-primary mb-4">
                      Cardiology Specialist
                    </h6>
                    <p className="m-0">
                      Dolor lorem eos dolor duo eirmod sea. Dolor sit magna
                      rebum clita rebum dolor
                    </p>
                  </div>
                  <div className="d-flex mt-auto border-top p-4">
                    <a
                      className="btn btn-lg btn-primary btn-lg-square rounded-circle me-3"
                      href="#!"
                    >
                      <i className="fab fa-twitter"></i>
                    </a>
                    <a
                      className="btn btn-lg btn-primary btn-lg-square rounded-circle me-3"
                      href="#!"
                    >
                      <i className="fab fa-facebook-f"></i>
                    </a>
                    <a
                      className="btn btn-lg btn-primary btn-lg-square rounded-circle"
                      href="#!"
                    >
                      <i className="fab fa-linkedin-in"></i>
                    </a>
                  </div>
                </div>
              </div>
            </div>
            <div className="team-item">
              <div className="row g-0 bg-light rounded overflow-hidden">
                <div className="col-12 col-sm-5 h-100">
                  <Image
                    src="/img/team-3.jpg"
                    alt="Doctor"
                    width={300}
                    height={350}
                    className="img-fluid h-100"
                    style={{ objectFit: "cover" }}
                  />
                </div>
                <div className="col-12 col-sm-7 h-100 d-flex flex-column">
                  <div className="mt-auto p-4">
                    <h3>Doctor Name</h3>
                    <h6 className="fw-normal fst-italic text-primary mb-4">
                      Cardiology Specialist
                    </h6>
                    <p className="m-0">
                      Dolor lorem eos dolor duo eirmod sea. Dolor sit magna
                      rebum clita rebum dolor
                    </p>
                  </div>
                  <div className="d-flex mt-auto border-top p-4">
                    <a
                      className="btn btn-lg btn-primary btn-lg-square rounded-circle me-3"
                      href="#!"
                    >
                      <i className="fab fa-twitter"></i>
                    </a>
                    <a
                      className="btn btn-lg btn-primary btn-lg-square rounded-circle me-3"
                      href="#!"
                    >
                      <i className="fab fa-facebook-f"></i>
                    </a>
                    <a
                      className="btn btn-lg btn-primary btn-lg-square rounded-circle"
                      href="#!"
                    >
                      <i className="fab fa-linkedin-in"></i>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Team End */}

      {/* Search Start */}
      <div className="container-fluid bg-primary my-5 py-5">
        <div className="container py-5">
          <div
            className="text-center mx-auto mb-5"
            style={{ maxWidth: "500px" }}
          >
            <h5 className="d-inline-block text-white text-uppercase border-bottom border-5">
              Find A Doctor
            </h5>
            <h1 className="display-4 mb-4">Find A Healthcare Professionals</h1>
            <h5 className="text-white fw-normal">
              Duo ipsum erat stet dolor sea ut nonumy tempor. Tempor duo lorem
              eos sit sed ipsum takimata ipsum sit est. Ipsum ea voluptua ipsum
              sit justo
            </h5>
          </div>
          <div className="mx-auto" style={{ width: "100%", maxWidth: "600px" }}>
            <div className="input-group">
              <select
                className="form-select border-primary w-25"
                style={{ height: "60px" }}
                defaultValue=""
              >
                <option value="">Department</option>
                <option value="1">Department 1</option>
                <option value="2">Department 2</option>
                <option value="3">Department 3</option>
              </select>
              <input
                type="text"
                className="form-control border-primary w-50"
                placeholder="Keyword"
              />
              <button className="btn btn-dark border-0 w-25">Search</button>
            </div>
          </div>
        </div>
      </div>
      {/* Search End */}

      {/* Testimonial Start */}
      <div className="container-fluid py-5">
        <div className="container">
          <div
            className="text-center mx-auto mb-5"
            style={{ maxWidth: "500px" }}
          >
            <h5 className="d-inline-block text-primary text-uppercase border-bottom border-5">
              Testimonial
            </h5>
            <h1 className="display-4">Patients Say About Our Services</h1>
          </div>
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="owl-carousel testimonial-carousel">
                <div className="testimonial-item text-center">
                  <div className="position-relative mb-5">
                    <Image
                      src="/img/testimonial-1.jpg"
                      alt="Testimonial"
                      width={150}
                      height={150}
                      className="img-fluid rounded-circle mx-auto"
                    />
                    <div
                      className="position-absolute top-100 start-50 translate-middle d-flex align-items-center justify-content-center bg-white rounded-circle"
                      style={{ width: "60px", height: "60px" }}
                    >
                      <i className="fa fa-quote-left fa-2x text-primary"></i>
                    </div>
                  </div>
                  <p className="fs-4 fw-normal">
                    Dolores sed duo clita tempor justo dolor et stet lorem kasd
                    labore dolore lorem ipsum. At lorem lorem magna ut et,
                    nonumy et labore et tempor diam tempor erat. Erat dolor
                    rebum sit ipsum.
                  </p>
                  <hr className="w-25 mx-auto" />
                  <h3>Patient Name</h3>
                  <h6 className="fw-normal text-primary mb-3">Profession</h6>
                </div>
                <div className="testimonial-item text-center">
                  <div className="position-relative mb-5">
                    <Image
                      src="/img/testimonial-2.jpg"
                      alt="Testimonial"
                      width={150}
                      height={150}
                      className="img-fluid rounded-circle mx-auto"
                    />
                    <div
                      className="position-absolute top-100 start-50 translate-middle d-flex align-items-center justify-content-center bg-white rounded-circle"
                      style={{ width: "60px", height: "60px" }}
                    >
                      <i className="fa fa-quote-left fa-2x text-primary"></i>
                    </div>
                  </div>
                  <p className="fs-4 fw-normal">
                    Dolores sed duo clita tempor justo dolor et stet lorem kasd
                    labore dolore lorem ipsum. At lorem lorem magna ut et,
                    nonumy et labore et tempor diam tempor erat. Erat dolor
                    rebum sit ipsum.
                  </p>
                  <hr className="w-25 mx-auto" />
                  <h3>Patient Name</h3>
                  <h6 className="fw-normal text-primary mb-3">Profession</h6>
                </div>
                <div className="testimonial-item text-center">
                  <div className="position-relative mb-5">
                    <Image
                      src="/img/testimonial-3.jpg"
                      alt="Testimonial"
                      width={150}
                      height={150}
                      className="img-fluid rounded-circle mx-auto"
                    />
                    <div
                      className="position-absolute top-100 start-50 translate-middle d-flex align-items-center justify-content-center bg-white rounded-circle"
                      style={{ width: "60px", height: "60px" }}
                    >
                      <i className="fa fa-quote-left fa-2x text-primary"></i>
                    </div>
                  </div>
                  <p className="fs-4 fw-normal">
                    Dolores sed duo clita tempor justo dolor et stet lorem kasd
                    labore dolore lorem ipsum. At lorem lorem magna ut et,
                    nonumy et labore et tempor diam tempor erat. Erat dolor
                    rebum sit ipsum.
                  </p>
                  <hr className="w-25 mx-auto" />
                  <h3>Patient Name</h3>
                  <h6 className="fw-normal text-primary mb-3">Profession</h6>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Testimonial End */}

      {/* Blog Start */}
      <div className="container-fluid py-5">
        <div className="container">
          <div
            className="text-center mx-auto mb-5"
            style={{ maxWidth: "500px" }}
          >
            <h5 className="d-inline-block text-primary text-uppercase border-bottom border-5">
              Blog Post
            </h5>
            <h1 className="display-4">Our Latest Medical Blog Posts</h1>
          </div>
          <div className="row g-5">
            <div className="col-xl-4 col-lg-6">
              <div className="bg-light rounded overflow-hidden">
                <Image
                  src="/img/blog-1.jpg"
                  alt="Blog"
                  width={400}
                  height={250}
                  className="img-fluid w-100"
                />
                <div className="p-4">
                  <a className="h3 d-block mb-3" href="#!">
                    Dolor clita vero elitr sea stet dolor justo diam
                  </a>
                  <p className="m-0">
                    Dolor lorem eos dolor duo et eirmod sea. Dolor sit magna
                    rebum clita rebum dolor stet amet justo
                  </p>
                </div>
                <div className="d-flex justify-content-between border-top p-4">
                  <div className="d-flex align-items-center">
                    <Image
                      src="/img/user.jpg"
                      alt="User"
                      width={25}
                      height={25}
                      className="rounded-circle me-2"
                    />
                    <small>John Doe</small>
                  </div>
                  <div className="d-flex align-items-center">
                    <small className="ms-3">
                      <i className="far fa-eye text-primary me-1"></i>12345
                    </small>
                    <small className="ms-3">
                      <i className="far fa-comment text-primary me-1"></i>123
                    </small>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xl-4 col-lg-6">
              <div className="bg-light rounded overflow-hidden">
                <Image
                  src="/img/blog-2.jpg"
                  alt="Blog"
                  width={400}
                  height={250}
                  className="img-fluid w-100"
                />
                <div className="p-4">
                  <a className="h3 d-block mb-3" href="#!">
                    Dolor clita vero elitr sea stet dolor justo diam
                  </a>
                  <p className="m-0">
                    Dolor lorem eos dolor duo et eirmod sea. Dolor sit magna
                    rebum clita rebum dolor stet amet justo
                  </p>
                </div>
                <div className="d-flex justify-content-between border-top p-4">
                  <div className="d-flex align-items-center">
                    <Image
                      src="/img/user.jpg"
                      alt="User"
                      width={25}
                      height={25}
                      className="rounded-circle me-2"
                    />
                    <small>John Doe</small>
                  </div>
                  <div className="d-flex align-items-center">
                    <small className="ms-3">
                      <i className="far fa-eye text-primary me-1"></i>12345
                    </small>
                    <small className="ms-3">
                      <i className="far fa-comment text-primary me-1"></i>123
                    </small>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xl-4 col-lg-6">
              <div className="bg-light rounded overflow-hidden">
                <Image
                  src="/img/blog-3.jpg"
                  alt="Blog"
                  width={400}
                  height={250}
                  className="img-fluid w-100"
                />
                <div className="p-4">
                  <a className="h3 d-block mb-3" href="#!">
                    Dolor clita vero elitr sea stet dolor justo diam
                  </a>
                  <p className="m-0">
                    Dolor lorem eos dolor duo et eirmod sea. Dolor sit magna
                    rebum clita rebum dolor stet amet justo
                  </p>
                </div>
                <div className="d-flex justify-content-between border-top p-4">
                  <div className="d-flex align-items-center">
                    <Image
                      src="/img/user.jpg"
                      alt="User"
                      width={25}
                      height={25}
                      className="rounded-circle me-2"
                    />
                    <small>John Doe</small>
                  </div>
                  <div className="d-flex align-items-center">
                    <small className="ms-3">
                      <i className="far fa-eye text-primary me-1"></i>12345
                    </small>
                    <small className="ms-3">
                      <i className="far fa-comment text-primary me-1"></i>123
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Blog End */}

      <Footer />

      <BackToTop />
    </>
  );
}
