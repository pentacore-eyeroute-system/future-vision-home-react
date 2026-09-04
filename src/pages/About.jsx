import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import './About.css'

const mapHashToAboutTab = (hash) => {
  if (!hash) return null
  const clean = hash.replace(/^#/, '').toLowerCase()
  if (clean === 'founder' || clean === 'founder-background') return 'founder'
  if (clean === 'story' || clean === 'our-story') return 'story'
  return null
}

function About() {
  const location = useLocation()
  const [tab, setTab] = useState(() => mapHashToAboutTab(location.hash) || 'story')

  useEffect(() => {
    const tabFromHash = mapHashToAboutTab(location.hash)
    if (tabFromHash && tabFromHash !== tab) {
      setTab(tabFromHash)
    }
  }, [location.hash])

  const handleTabChange = (selectedTab) => {
    setTab(selectedTab)
    window.history.replaceState(null, '', `#${selectedTab}`)
  }

  return (
    <>
      <section className="page-header">
        <div className="container">
          <h1 className="page-title">About Us</h1>
          <p className="page-subtitle">
            Learn about our mission, vision, and the story behind Future Vision Home
          </p>
        </div>
      </section>

      <section className="work-tabs">
        <div className="container">
          <div className="tabs-nav">
            <button
              className={`tab-btn${tab === 'story' ? ' active' : ''}`}
              onClick={() => handleTabChange('story')}
            >
              Our Story
            </button>
            <button
              className={`tab-btn${tab === 'founder' ? ' active' : ''}`}
              onClick={() => handleTabChange('founder')}
            >
              Founder&apos;s Background
            </button>
          </div>
        </div>
      </section>

      <section id="story" className={`work-section${tab === 'story' ? ' active' : ''}`}>
        <div className="container">
          <div className="about-content">
            <div className="story-content">
              <div className="story-left-column">
                <h2 className="story-title">
                  Future Vision Home is the flagship project of Future Vision Sighted-Blind Inc.
                </h2>

                <div className="video-section">
                  <div className="video-container">
                    <iframe
                      width="100%"
                      height="480"
                      src="https://www.youtube.com/embed/MGvJQoxRcvQ?rel=0&showinfo=0"
                      title="Future Vision Home Story"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      referrerPolicy="no-referrer-when-downgrade"
                      className="youtube-video"
                    ></iframe>
                  </div>
                </div>

                <p className="story-text about-story-text-top">
                  <strong>FUTURE VISION SIGHTED-BLIND INC.</strong> is registered as a non-profit
                  organization which is composed of blind and visually impaired members as well as
                  parents/guardians. Its purpose is to give empowerment to the blind and/vision
                  impaired of the country so as to make them contributors and not burdens to the
                  society.
                </p>
              </div>

              <div className="story-right-column">
                <div className="svm-grid about-svm-column-grid">
                  <div className="svm-card">
                    <div className="svm-header">
                      <img src="/images/vision.png" alt="Vision" className="svm-icon" />
                      <h2 className="svm-title">Our Vision</h2>
                    </div>
                    <p className="svm-description">
                      We envision a country in which blind and visually impaired as well as sighted youth
                      are encouraged to live a life guided by their own vision regardless of their gender,
                      beliefs, or disabilities.
                    </p>
                    <p className="svm-description">
                      We believe in a future where visual impairment is not a barrier to success, but
                      rather a unique perspective that enriches our communities. Our vision extends beyond
                      providing services—we aim to transform societal attitudes and create an inclusive
                      environment where everyone can thrive.
                    </p>
                  </div>
                  <div className="svm-card">
                    <div className="svm-header">
                      <img src="/images/mission.png" alt="Mission" className="svm-icon" />
                      <h2 className="svm-title">Our Mission</h2>
                    </div>
                    <p className="svm-description">
                      It is our mission to improve access to education by establishing a home that allows
                      children and youth to attend the regular schools. A home that provides a supportive
                      environment where blind and sighted children live, learn, and develop independence as
                      well as social, communication and creative thinking skills. Obtaining these skills
                      will significantly impact not only their life but also the world.
                    </p>
                    <p className="svm-description">
                      Through our residential program, educational support, and comprehensive training, we
                      empower individuals to become confident, independent, and contributing members of
                      society. We work tirelessly to ensure that every person we serve has the tools and
                      opportunities they need to succeed.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="founder" className={`work-section${tab === 'founder' ? ' active' : ''}`}>
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Founder&apos;s Background</h2>
          </div>

          <div className="founder-intro-section">
            <h3 className="founder-name-intro">
              My name is Lorena Acula and I am the founder of Future Vision Sighted Blind Inc.
            </h3>
            <p>
              The goal of my organization is to empower blind children and adults who belong to a
              low-income family in a safe and supportive homely learning environment. We provide the
              necessary skills and prepare them so they can integrate themselves, not only in schools but
              also in the community and at the same time become contributors to our society.
            </p>
          </div>

          <div className="founder-media-section">
            <div className="founder-image-section">
              <div className="founder-image-placeholder">
                <img src="/images/lorena.png" alt="Portrait of Lorena Acula" />
              </div>
            </div>

            <div className="video-section">
              <div className="video-container">
                <iframe
                  width="100%"
                  height="515"
                  src="https://www.youtube.com/embed/z4Yz3kFGJ3M?rel=0&showinfo=0"
                  title="Founder's Background Video"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                  className="youtube-video"
                ></iframe>
              </div>
            </div>
          </div>

          <div className="founder-story-section">
            <h3>A Vision from a Blind Person&apos;s Perspective</h3>
            <p>
              As the youngest of six siblings, and the only blind child in the family, I can say that I had
              all the affection I needed. I always felt loved and cared for. Due to poverty, we all had to
              stop studying except for my only brother. One day, an opportunity came to study free at a
              residential school for the poorest of the poor children in Manila. As expected, my father was
              against it. He was worried about me and was firm in his decision. With a strong desire to
              study however, I managed to convince my father.
            </p>
            <p>
              For a person with low vision like me then, high School was difficult. I could not participate
              in many activities and I did not perform so well in class. Determined to learn, I used my
              sense of hearing to catch up. Though as if I were always hanging at the tail of a plane, I
              still passed my examinations. Luckily, my Principal noticed this, and I could complete High
              School.
            </p>
            <p>
              After graduation, I could see very little and stayed at home. But to me the home felt like a
              prison cell. I never had freedom to do anything in the house. Everything was snatched from my
              hands, they would not let me do any chores and can you imagine, even until eighteen my sister
              had to bathe me. The food was always set on the table when I was left at home. One time, the
              food that was prepared was so dry, so I wanted to have some soup. I found instant noodles and
              then I heated water on the stove. Actually, it was my first time to light a stove because I
              was never permitted to do so. When my parents came home, they were angry at me. I did not care
              as I had proven that I could be independent, and I felt delighted to eat what I had cooked for
              the first time.
            </p>
            <p>
              Even if I had a white cane; my parents did not like me to use it and always asked me to keep it
              away. I could only use it when they were not around. Every weekend, I used to go and sleep
              over at a dormitory in a neighboring city. There, I had the freedom to use my white cane. One
              time my father came to fetch me and was shocked to see me walking by myself. He could hardly
              believe that it was me. This however changed his perception, from then onward, he loves to see
              me with my cane.
            </p>
            <p>
              After finishing my training at Kanthari in Kerala, India, in January 2014 I started a pilot
              project called &quot;Future Vision Home.&quot; Through Kanthari and the startup funding from
              Braille Without Borders as well as tireless support from family and friends, the organization
              is registered at the Securities and Exchange Commission (SEC) by the name &quot;Future Vision
              Sighted-Blind Inc.
            </p>
            <p>
              In 2015 the Dutch Doel Voor Ogen association has helped me in the second year of operations.
              And in the following year till the present, I sustain the project through the salary I receive
              as a government Special Education Teacher as well with some contributions from the
              beneficiaries and sometimes from friends.
            </p>
          </div>
        </div>
      </section>
    </>
  )
}

export default About
