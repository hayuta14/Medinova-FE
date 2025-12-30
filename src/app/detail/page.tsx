'use client';

import { useState } from 'react';
import Image from 'next/image';
import Topbar from '@/components/Topbar';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BackToTop from '@/components/BackToTop';

interface Comment {
  id: number;
  name: string;
  date: string;
  content: string;
  replies?: Comment[];
}

export default function Detail() {
  const [comments, setComments] = useState<Comment[]>([
    {
      id: 1,
      name: 'John Doe',
      date: '01 Jan 2045',
      content: 'Diam amet duo labore stet elitr invidunt ea clita ipsum voluptua, tempor labore accusam ipsum et no at. Kasd diam tempor rebum magna dolores sed eirmod',
      replies: [],
    },
    {
      id: 2,
      name: 'John Doe',
      date: '01 Jan 2045',
      content: 'Diam amet duo labore stet elitr invidunt ea clita ipsum voluptua, tempor labore accusam ipsum et no at. Kasd diam tempor rebum magna dolores sed eirmod',
      replies: [],
    },
    {
      id: 3,
      name: 'John Doe',
      date: '01 Jan 2045',
      content: 'Diam amet duo labore stet elitr invidunt ea clita ipsum voluptua, tempor labore accusam ipsum et no at. Kasd diam tempor rebum magna dolores sed eirmod',
      replies: [],
    },
  ]);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyForm, setReplyForm] = useState({ name: '', email: '', content: '' });

  const handleReplyClick = (commentId: number) => {
    setReplyingTo(replyingTo === commentId ? null : commentId);
    setReplyForm({ name: '', email: '', content: '' });
  };

  const handleReplySubmit = (e: React.FormEvent, commentId: number) => {
    e.preventDefault();
    
    if (!replyForm.name.trim() || !replyForm.content.trim()) {
      return;
    }

    const newReply: Comment = {
      id: Date.now(),
      name: replyForm.name,
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      content: replyForm.content,
      replies: [],
    };

    setComments(comments.map(comment => {
      if (comment.id === commentId) {
        return {
          ...comment,
          replies: [...(comment.replies || []), newReply],
        };
      }
      return comment;
    }));

    setReplyForm({ name: '', email: '', content: '' });
    setReplyingTo(null);
  };

  const handleReplyFormChange = (field: string, value: string) => {
    setReplyForm(prev => ({ ...prev, [field]: value }));
  };

  const renderComment = (comment: Comment, isReply: boolean = false) => {
    return (
      <div key={comment.id} className={`d-flex mb-4 ${isReply ? 'ms-5' : ''}`}>
        <Image
          src="/img/user.jpg"
          alt="User"
          width={45}
          height={45}
          className="img-fluid rounded-circle"
          style={{ objectFit: 'cover', width: '45px', height: '45px' }}
        />
        <div className="ps-3" style={{ flex: 1 }}>
          <h6>
            <a href="#!">{comment.name}</a> <small>
              <i>{comment.date}</i>
            </small>
          </h6>
          <p>{comment.content}</p>
          <button 
            className="btn btn-sm btn-light"
            onClick={() => handleReplyClick(comment.id)}
          >
            Reply
          </button>

          {/* Reply Form */}
          {replyingTo === comment.id && (
            <div className="mt-3 bg-white rounded p-3 border">
              <h6 className="mb-3">Reply to {comment.name}</h6>
              <form onSubmit={(e) => handleReplySubmit(e, comment.id)}>
                <div className="row g-2">
                  <div className="col-12 col-sm-6">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Your Name"
                      value={replyForm.name}
                      onChange={(e) => handleReplyFormChange('name', e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-12 col-sm-6">
                    <input
                      type="email"
                      className="form-control"
                      placeholder="Your Email"
                      value={replyForm.email}
                      onChange={(e) => handleReplyFormChange('email', e.target.value)}
                    />
                  </div>
                  <div className="col-12">
                    <textarea
                      className="form-control"
                      rows={3}
                      placeholder="Your Reply"
                      value={replyForm.content}
                      onChange={(e) => handleReplyFormChange('content', e.target.value)}
                      required
                    ></textarea>
                  </div>
                  <div className="col-12">
                    <div className="d-flex gap-2">
                      <button type="submit" className="btn btn-primary btn-sm">
                        Submit Reply
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => {
                          setReplyingTo(null);
                          setReplyForm({ name: '', email: '', content: '' });
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* Render Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-3">
              {comment.replies.map(reply => renderComment(reply, true))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const totalComments = comments.length + comments.reduce((acc, comment) => acc + (comment.replies?.length || 0), 0);

  return (
    <>
      <Topbar />
      <Navbar />

      {/* Blog Start */}
      <div className="container py-5">
        <div className="row g-5">
          <div className="col-lg-8">
            {/* Blog Detail Start */}
            <div className="mb-5">
              <Image
                src="/img/blog-2.jpg"
                alt="Blog"
                width={800}
                height={400}
                className="img-fluid w-100 rounded mb-5"
              />
              <h1 className="mb-4">
                Diam dolor est labore duo ipsum clita sed et lorem tempor sanctus lorem kasd duo
              </h1>
              <p>
                Sadipscing labore amet rebum est et justo gubergren. Et eirmod ipsum sit diam ut
                magna lorem. Nonumy vero labore lorem sanctus rebum et lorem magna kasd, stet amet
                magna accusam consetetur eirmod. Kasd accusam sit ipsum sadipscing et at at
                sanctus et. Ipsum sit gubergren dolores et, consetetur justo invidunt at et
                aliquyam ut et vero clita. Diam sea sea no sed dolores diam nonumy, gubergren sit
                stet no diam kasd vero.
              </p>
              <p>
                Voluptua est takimata stet invidunt sed rebum nonumy stet, clita aliquyam dolores
                vero stet consetetur elitr takimata rebum sanctus. Sit sed accusam stet sit
                nonumy kasd diam dolores, sanctus lorem kasd duo dolor dolor vero sit et. Labore
                ipsum duo sanctus amet eos et. Consetetur no sed et aliquyam ipsum justo et,
                clita lorem sit vero amet amet est dolor elitr, stet et no diam sit. Dolor erat
                justo dolore sit invidunt.
              </p>
              <p>
                Diam dolor est labore duo invidunt ipsum clita et, sed et lorem voluptua tempor
                invidunt at est sanctus sanctus. Clita dolores sit kasd diam takimata justo diam
                lorem sed. Magna amet sed rebum eos. Clita no magna no dolor erat diam tempor
                rebum consetetur, sanctus labore sed nonumy diam lorem amet eirmod. No at tempor
                sea diam kasd, takimata ea nonumy elitr sadipscing gubergren erat. Gubergren at
                lorem invidunt sadipscing rebum sit amet ut ut, voluptua diam dolores at
                sadipscing stet. Clita dolor amet dolor ipsum vero ea ea eos.
              </p>
              <div className="d-flex justify-content-between bg-light rounded p-4 mt-4 mb-4">
                <div className="d-flex align-items-center">
                  <Image
                    src="/img/user.jpg"
                    alt="User"
                    width={40}
                    height={40}
                    className="rounded-circle me-2"
                    style={{ objectFit: 'cover', width: '40px', height: '40px' }}
                  />
                  <span>John Doe</span>
                </div>
                <div className="d-flex align-items-center">
                  <span className="ms-3">
                    <i className="far fa-eye text-primary me-1"></i>12345
                  </span>
                  <span className="ms-3">
                    <i className="far fa-comment text-primary me-1"></i>123
                  </span>
                </div>
              </div>
            </div>
            {/* Blog Detail End */}

            {/* Comment List Start */}
            <div className="mb-5">
              <h4 className="d-inline-block text-primary text-uppercase border-bottom border-5 mb-4">
                {totalComments} Comment{totalComments !== 1 ? 's' : ''}
              </h4>
              {comments.map(comment => renderComment(comment))}
            </div>
            {/* Comment List End */}

            {/* Comment Form Start */}
            <div className="bg-light rounded p-5">
              <h4 className="d-inline-block text-primary text-uppercase border-bottom border-5 border-white mb-4">
                Leave a comment
              </h4>
              <form>
                <div className="row g-3">
                  <div className="col-12 col-sm-6">
                    <input
                      type="text"
                      className="form-control bg-white border-0"
                      placeholder="Your Name"
                      style={{ height: '55px' }}
                    />
                  </div>
                  <div className="col-12 col-sm-6">
                    <input
                      type="email"
                      className="form-control bg-white border-0"
                      placeholder="Your Email"
                      style={{ height: '55px' }}
                    />
                  </div>
                  <div className="col-12">
                    <input
                      type="text"
                      className="form-control bg-white border-0"
                      placeholder="Website"
                      style={{ height: '55px' }}
                    />
                  </div>
                  <div className="col-12">
                    <textarea
                      className="form-control bg-white border-0"
                      rows={5}
                      placeholder="Comment"
                    ></textarea>
                  </div>
                  <div className="col-12">
                    <button className="btn btn-primary w-100 py-3" type="submit">
                      Leave Your Comment
                    </button>
                  </div>
                </div>
              </form>
            </div>
            {/* Comment Form End */}
          </div>

          {/* Sidebar Start */}
          <div className="col-lg-4">
            {/* Search Form Start */}
            <div className="mb-5">
              <div className="input-group">
                <input type="text" className="form-control p-3" placeholder="Keyword" />
                <button className="btn btn-primary px-3">
                  <i className="fa fa-search"></i>
                </button>
              </div>
            </div>
            {/* Search Form End */}

            {/* Category Start */}
            <div className="mb-5">
              <h4 className="d-inline-block text-primary text-uppercase border-bottom border-5 mb-4">
                Categories
              </h4>
              <div className="d-flex flex-column justify-content-start">
                {['Web Design', 'Web Development', 'Web Development', 'Keyword Research', 'Email Marketing'].map(
                  (cat, i) => (
                    <a key={i} className="h5 bg-light rounded py-2 px-3 mb-2" href="#!">
                      <i className="fa fa-angle-right me-2"></i>
                      {cat}
                    </a>
                  )
                )}
              </div>
            </div>
            {/* Category End */}

            {/* Recent Post Start */}
            <div className="mb-5">
              <h4 className="d-inline-block text-primary text-uppercase border-bottom border-5 mb-4">
                Recent Post
              </h4>
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="d-flex rounded overflow-hidden mb-3">
                  <Image
                    src={`/img/blog-${((i - 1) % 3) + 1}.jpg`}
                    alt="Blog"
                    width={100}
                    height={100}
                    className="img-fluid"
                    style={{ objectFit: 'cover' }}
                  />
                  <a href="#!" className="h5 d-flex align-items-center bg-light px-3 mb-0">
                    Lorem ipsum dolor sit amet consec adipis elit
                  </a>
                </div>
              ))}
            </div>
            {/* Recent Post End */}

            {/* Image Start */}
            <div className="mb-5">
              <Image src="/img/blog-1.jpg" alt="" width={400} height={300} className="img-fluid rounded" />
            </div>
            {/* Image End */}

            {/* Tags Start */}
            <div className="mb-5">
              <h4 className="d-inline-block text-primary text-uppercase border-bottom border-5 mb-4">
                Tag Cloud
              </h4>
              <div className="d-flex flex-wrap m-n1">
                {['Design', 'Development', 'Marketing', 'SEO', 'Writing', 'Consulting'].map((tag, i) => (
                  <a key={i} href="#!" className="btn btn-primary m-1">
                    {tag}
                  </a>
                ))}
                {['Design', 'Development', 'Marketing', 'SEO', 'Writing', 'Consulting'].map((tag, i) => (
                  <a key={i} href="#!" className="btn btn-primary m-1">
                    {tag}
                  </a>
                ))}
              </div>
            </div>
            {/* Tags End */}

            {/* Plain Text Start */}
            <div>
              <h4 className="d-inline-block text-primary text-uppercase border-bottom border-5 mb-4">
                Plain Text
              </h4>
              <div className="bg-light rounded text-center" style={{ padding: '30px' }}>
                <p>
                  Vero sea et accusam justo dolor accusam lorem consetetur, dolores sit amet sit
                  dolor clita kasd justo, diam accusam no sea ut tempor magna takimata, amet sit
                  et diam dolor ipsum amet diam
                </p>
                <a href="#!" className="btn btn-primary py-2 px-4">
                  Read More
                </a>
              </div>
            </div>
            {/* Plain Text End */}
          </div>
          {/* Sidebar End */}
        </div>
      </div>
      {/* Blog End */}

      <Footer />
      <BackToTop />
    </>
  );
}

