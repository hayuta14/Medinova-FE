import Image from 'next/image';
import Topbar from '@/components/Topbar';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BackToTop from '@/components/BackToTop';

export default function About() {
  return (
    <>
      <Topbar />
      <Navbar />

      {/* About Start */}
      <div className="container-fluid py-5">
        <div className="container">
          <div className="row gx-5">
            <div className="col-lg-5 mb-5 mb-lg-0" style={{ minHeight: '500px' }}>
              <div className="position-relative h-100">
                <Image
                  src="/img/about.jpg"
                  alt="About"
                  fill
                  className="position-absolute w-100 h-100 rounded"
                  style={{ objectFit: 'cover' }}
                />
              </div>
            </div>
            <div className="col-lg-7">
              <div className="mb-4">
                <h5 className="d-inline-block text-primary text-uppercase border-bottom border-5">
                  About Us
                </h5>
                <h1 className="display-4">Best Medical Care For Yourself and Your Family</h1>
              </div>
              <p>
                Tempor erat elitr at rebum at at clita aliquyam consetetur. Diam dolor diam ipsum
                et, tempor voluptua sit consetetur sit. Aliquyam diam amet diam et eos sadipscing
                labore. Clita erat ipsum et lorem et sit, sed stet no labore lorem sit. Sanctus
                clita duo justo et tempor consetetur takimata eirmod, dolores takimata consetetur
                invidunt magna dolores aliquyam dolores dolore. Amet erat amet et magna
              </p>
              <div className="row g-3 pt-3">
                <div className="col-sm-3 col-6">
                  <div className="bg-light text-center rounded-circle py-4">
                    <i className="fa fa-3x fa-user-md text-primary mb-3"></i>
                    <h6 className="mb-0">
                      Qualified<small className="d-block text-primary">Doctors</small>
                    </h6>
                  </div>
                </div>
                <div className="col-sm-3 col-6">
                  <div className="bg-light text-center rounded-circle py-4">
                    <i className="fa fa-3x fa-procedures text-primary mb-3"></i>
                    <h6 className="mb-0">
                      Emergency<small className="d-block text-primary">Services</small>
                    </h6>
                  </div>
                </div>
                <div className="col-sm-3 col-6">
                  <div className="bg-light text-center rounded-circle py-4">
                    <i className="fa fa-3x fa-microscope text-primary mb-3"></i>
                    <h6 className="mb-0">
                      Accurate<small className="d-block text-primary">Testing</small>
                    </h6>
                  </div>
                </div>
                <div className="col-sm-3 col-6">
                  <div className="bg-light text-center rounded-circle py-4">
                    <i className="fa fa-3x fa-ambulance text-primary mb-3"></i>
                    <h6 className="mb-0">
                      Free<small className="d-block text-primary">Ambulance</small>
                    </h6>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* About End */}

      {/* Team Start */}
      <div className="container-fluid py-5">
        <div className="container">
          <div className="text-center mx-auto mb-5" style={{ maxWidth: '500px' }}>
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
                    style={{ objectFit: 'cover' }}
                  />
                </div>
                <div className="col-12 col-sm-7 h-100 d-flex flex-column">
                  <div className="mt-auto p-4">
                    <h3>Doctor Name</h3>
                    <h6 className="fw-normal fst-italic text-primary mb-4">Cardiology Specialist</h6>
                    <p className="m-0">
                      Dolor lorem eos dolor duo eirmod sea. Dolor sit magna rebum clita rebum dolor
                    </p>
                  </div>
                  <div className="d-flex mt-auto border-top p-4">
                    <a className="btn btn-lg btn-primary btn-lg-square rounded-circle me-3" href="#!">
                      <i className="fab fa-twitter"></i>
                    </a>
                    <a className="btn btn-lg btn-primary btn-lg-square rounded-circle me-3" href="#!">
                      <i className="fab fa-facebook-f"></i>
                    </a>
                    <a className="btn btn-lg btn-primary btn-lg-square rounded-circle" href="#!">
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
                    style={{ objectFit: 'cover' }}
                  />
                </div>
                <div className="col-12 col-sm-7 h-100 d-flex flex-column">
                  <div className="mt-auto p-4">
                    <h3>Doctor Name</h3>
                    <h6 className="fw-normal fst-italic text-primary mb-4">Cardiology Specialist</h6>
                    <p className="m-0">
                      Dolor lorem eos dolor duo eirmod sea. Dolor sit magna rebum clita rebum dolor
                    </p>
                  </div>
                  <div className="d-flex mt-auto border-top p-4">
                    <a className="btn btn-lg btn-primary btn-lg-square rounded-circle me-3" href="#!">
                      <i className="fab fa-twitter"></i>
                    </a>
                    <a className="btn btn-lg btn-primary btn-lg-square rounded-circle me-3" href="#!">
                      <i className="fab fa-facebook-f"></i>
                    </a>
                    <a className="btn btn-lg btn-primary btn-lg-square rounded-circle" href="#!">
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
                    style={{ objectFit: 'cover' }}
                  />
                </div>
                <div className="col-12 col-sm-7 h-100 d-flex flex-column">
                  <div className="mt-auto p-4">
                    <h3>Doctor Name</h3>
                    <h6 className="fw-normal fst-italic text-primary mb-4">Cardiology Specialist</h6>
                    <p className="m-0">
                      Dolor lorem eos dolor duo eirmod sea. Dolor sit magna rebum clita rebum dolor
                    </p>
                  </div>
                  <div className="d-flex mt-auto border-top p-4">
                    <a className="btn btn-lg btn-primary btn-lg-square rounded-circle me-3" href="#!">
                      <i className="fab fa-twitter"></i>
                    </a>
                    <a className="btn btn-lg btn-primary btn-lg-square rounded-circle me-3" href="#!">
                      <i className="fab fa-facebook-f"></i>
                    </a>
                    <a className="btn btn-lg btn-primary btn-lg-square rounded-circle" href="#!">
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

      <Footer />
      <BackToTop />
    </>
  );
}

