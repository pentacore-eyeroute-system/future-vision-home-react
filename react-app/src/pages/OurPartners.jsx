import { useState, useEffect } from 'react'
import { partnerApi } from '../api/partnerApi'

const defaultParentNames = [
  'Rowena Pindug',
  'Mirasol Trinidad',
  '& Mrs Michael Olaso',
  'Malou Bueno',
  'Tita Ivy Sinones',
  'Arsenia C. Sinones',
  'Danica B. Par',
  'Tita Josephine L. Malan',
]

const isPartnerType = (partner, type) => partner.par_type?.toLowerCase() === type

function OurPartners() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const partners = await partnerApi.getPartners();

    setData(partners.result);
  };
 
  return (
    <>
      <section className="page-header">
        <div className="container">
          <h1 className="page-title">Our Partners</h1>
          <p className="page-subtitle">
            The following are individuals and organizations who lovingly shared their support to Future
            Vision Home in 2021.
          </p>
        </div>
      </section>

      <section className="partners-section">
        <div className="container">
          <div className="partners-content-wrapper">
            <PartnersCategory
              title="ORGANIZATIONS"
              names={data.filter(partner => isPartnerType(partner, 'organization')).map(partner => partner.par_fullname)}
            />

            <PartnersCategory
              title="INDIVIDUALS"
              names={data.filter(partner => isPartnerType(partner, 'individual')).map(partner => partner.par_fullname)}
            />

            <PartnersCategory
              title="PARENTS/GUARDIANS OF VISIONISTAS"
              names={[
                ...defaultParentNames,
                ...data
                  .filter(partner => isPartnerType(partner, 'parent'))
                  .map(partner => partner.par_fullname),
              ]}
            />
          </div>
        </div>
      </section>
    </>
  )
}

function PartnersCategory({ title, names }) {
  return (
    <div className="partners-category">
      <h2 className="partners-category-title">{title}</h2>
      <div className="partners-names-grid">
        {names.map((name) => (
          <p key={name}>{name}</p>
        ))}
      </div>
    </div>
  )
}

export default OurPartners
