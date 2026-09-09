import { useState, useEffect } from 'react'
import { partnerApi } from '../api/partnerApi'

const defaultOrganizations = [
  'Stichting kanthari',
  'Kanthari Foundation Switzerland',
  'Philippine Blind Union (PBU)',
  'Eusebio C. Santos Elementary School (ECSES)',
  'Department of Education (DepEd) Bureau of Education Assessment (BEA)',
  'Buling Pag-asa',
  'Persons with Different Abilities (PWDA) Bambang',
  'JORGE HORHE',
]

const defaultIndividuals = [
  'Cristy Villanueva',
  'Imee Licos Chulipa',
  'Sofia Villanueva',
  'Junver Arcayna',
  'Richi Arcayna (Ms. Jessa, Ms. Julia, Ms. Alyssa-Birthday Fund Raiser)',
  'Gigi Tibi',
  'Kristine Teves',
  'Runnesa Soriano',
  'Paola Jane Razon',
  'John Mark Limel Papag',
  'Senorita Edna D. Lhuillier',
  'Catherine B. Jones',
  'Limuel H. Vilela',
  'Wil Sabado',
  'Jing/Grace Montoya',
  'Andrea',
  'Judith C. Abando',
  'Nancy D. Medina',
]

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

const initialPartnersData = [
  ...defaultOrganizations.map(name => ({ par_fullname: name, par_type: 'organization' })),
  ...defaultIndividuals.map(name => ({ par_fullname: name, par_type: 'individual' })),
  ...defaultParentNames.map(name => ({ par_fullname: name, par_type: 'parent' })),
]

const isPartnerType = (partner, type) => partner.par_type?.toLowerCase() === type

function OurPartners() {
  const [data, setData] = useState(initialPartnersData)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const partners = await partnerApi.getPartners()
      if (partners?.result && partners.result.length > 0) {
        const apiPartners = partners.result
        const mergedMap = new Map()

        // Initialize with default items
        initialPartnersData.forEach((item) => {
          mergedMap.set(`${item.par_type}-${item.par_fullname.toLowerCase()}`, item)
        })

        // Merge API items
        apiPartners.forEach((item) => {
          if (item.par_fullname && item.par_type) {
            mergedMap.set(`${item.par_type.toLowerCase()}-${item.par_fullname.toLowerCase()}`, item)
          }
        })

        setData(Array.from(mergedMap.values()))
      }
    } catch (error) {
      console.error('Failed fetching partners:', error)
    }
  }

  const getCategoryNames = (type) => {
    return Array.from(
      new Set(
        data
          .filter((partner) => isPartnerType(partner, type))
          .map((partner) => partner.par_fullname)
      )
    )
  }

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
              names={getCategoryNames('organization')}
            />

            <PartnersCategory
              title="INDIVIDUALS"
              names={getCategoryNames('individual')}
            />

            <PartnersCategory
              title="PARENTS/GUARDIANS OF VISIONISTAS"
              names={getCategoryNames('parent')}
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
