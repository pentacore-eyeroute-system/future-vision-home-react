import { useState, useEffect, useMemo } from 'react'
import { partnerApi } from '../api/partnerApi'

const isPartnerType = (partner, type) => partner.par_type?.toLowerCase() === type

function OurPartners() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const controller = new AbortController()
    fetchData(controller.signal)
    return () => {
      controller.abort()
    }
  }, [])

  const fetchData = async (signal) => {
    try {
      setLoading(true)
      const partners = await partnerApi.getPartners({ signal })
      if (partners?.result && Array.isArray(partners.result)) {
        setData(partners.result)
      } else {
        setData([])
      }
    } catch (error) {
      if (error.name === 'CanceledError' || error.name === 'AbortError' || error.code === 'ERR_CANCELED') {
        return
      }
      console.error('Failed fetching partners:', error)
      setData([])
    } finally {
      setLoading(false)
    }
  }

  const organizations = useMemo(() => {
    return Array.from(
      new Set(
        data
          .filter((partner) => isPartnerType(partner, 'organization'))
          .map((partner) => partner.par_fullname)
          .filter(Boolean)
      )
    )
  }, [data])

  const individuals = useMemo(() => {
    return Array.from(
      new Set(
        data
          .filter((partner) => isPartnerType(partner, 'individual'))
          .map((partner) => partner.par_fullname)
          .filter(Boolean)
      )
    )
  }, [data])

  const parents = useMemo(() => {
    return Array.from(
      new Set(
        data
          .filter((partner) => isPartnerType(partner, 'parent'))
          .map((partner) => partner.par_fullname)
          .filter(Boolean)
      )
    )
  }, [data])

  return (
    <>
      <section className="page-header">
        <div className="container">
          <h1 className="page-title">Our Partners</h1>
          <p className="page-subtitle">
            The following are individuals and organizations who lovingly shared their support to Future
            Vision Home.
          </p>
        </div>
      </section>

      <section className="partners-section py-8">
        <div className="container">
          {loading ? (
            <div className="partners-content-wrapper space-y-8">
              {[1, 2, 3].map((idx) => (
                <div key={idx} className="partners-category">
                  <div className="skeleton-box h-8 w-64 rounded-md mb-6" />
                  <div className="partners-names-grid">
                    {[1, 2, 3, 4, 5, 6].map((cell) => (
                      <div key={cell} className="skeleton-box h-6 w-48 rounded" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="partners-content-wrapper">
              {organizations.length > 0 && (
                <PartnersCategory
                  title="ORGANIZATIONS"
                  names={organizations}
                />
              )}

              {individuals.length > 0 && (
                <PartnersCategory
                  title="INDIVIDUALS"
                  names={individuals}
                />
              )}

              {parents.length > 0 && (
                <PartnersCategory
                  title="PARENTS/GUARDIANS OF VISIONISTAS"
                  names={parents}
                />
              )}

              {organizations.length === 0 && individuals.length === 0 && parents.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  No partners available at this time.
                </div>
              )}
            </div>
          )}
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
