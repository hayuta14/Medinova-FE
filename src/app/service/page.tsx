import Topbar from "@/components/Topbar";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackToTop from "@/components/BackToTop";

export default function Service() {
  return (
    <>
      <Topbar />
      <Navbar />

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
                <a
                  className="btn btn-lg btn-primary rounded-pill"
                  href="services/emergency"
                >
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
                <a
                  className="btn btn-lg btn-primary rounded-pill"
                  href="services/surgery"
                >
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
                <a
                  className="btn btn-lg btn-primary rounded-pill"
                  href="services/outdoor-checkup"
                >
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
                <a
                  className="btn btn-lg btn-primary rounded-pill"
                  href="services/ambulance"
                >
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
                <a
                  className="btn btn-lg btn-primary rounded-pill"
                  href="services/pharmacy"
                >
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
                <a
                  className="btn btn-lg btn-primary rounded-pill"
                  href="services/blood-testing"
                >
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
              <a className="btn btn-dark rounded-pill py-3 px-5 me-3" href="#!">
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
              <div className="bg-white text-center rounded p-5">
                <h1 className="mb-4">Book An Appointment</h1>
                <form>
                  <div className="row g-3">
                    <div className="col-12 col-sm-6">
                      <select
                        className="form-select bg-light border-0"
                        style={{ height: "55px" }}
                        defaultValue=""
                      >
                        <option value="">Choose Department</option>
                        <option value="1">Department 1</option>
                        <option value="2">Department 2</option>
                        <option value="3">Department 3</option>
                      </select>
                    </div>
                    <div className="col-12 col-sm-6">
                      <select
                        className="form-select bg-light border-0"
                        style={{ height: "55px" }}
                        defaultValue=""
                      >
                        <option value="">Select Doctor</option>
                        <option value="1">Doctor 1</option>
                        <option value="2">Doctor 2</option>
                        <option value="3">Doctor 3</option>
                      </select>
                    </div>
                    <div className="col-12 col-sm-6">
                      <input
                        type="text"
                        className="form-control bg-light border-0"
                        placeholder="Your Name"
                        style={{ height: "55px" }}
                      />
                    </div>
                    <div className="col-12 col-sm-6">
                      <input
                        type="email"
                        className="form-control bg-light border-0"
                        placeholder="Your Email"
                        style={{ height: "55px" }}
                      />
                    </div>
                    <div className="col-12 col-sm-6">
                      <div
                        className="date"
                        id="date"
                        data-target-input="nearest"
                        style={{ position: "relative" }}
                      >
                        <input
                          type="text"
                          className="form-control bg-light border-0 datetimepicker-input"
                          placeholder="Date"
                          data-target="#date"
                          data-toggle="datetimepicker"
                          style={{ height: "55px" }}
                        />
                      </div>
                    </div>
                    <div className="col-12 col-sm-6">
                      <div
                        className="time"
                        id="time"
                        data-target-input="nearest"
                        style={{ position: "relative" }}
                      >
                        <input
                          type="text"
                          className="form-control bg-light border-0 datetimepicker-input"
                          placeholder="Time"
                          data-target="#time"
                          data-toggle="datetimepicker"
                          style={{ height: "55px" }}
                        />
                      </div>
                    </div>
                    <div className="col-12">
                      <button
                        className="btn btn-primary w-100 py-3"
                        type="submit"
                      >
                        Make An Appointment
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Appointment End */}

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
                    <img
                      className="img-fluid rounded-circle mx-auto"
                      src="/img/testimonial-1.jpg"
                      alt=""
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
                    <img
                      className="img-fluid rounded-circle mx-auto"
                      src="/img/testimonial-2.jpg"
                      alt=""
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
                    <img
                      className="img-fluid rounded-circle mx-auto"
                      src="/img/testimonial-3.jpg"
                      alt=""
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

      <Footer />
      <BackToTop />
    </>
  );
}
