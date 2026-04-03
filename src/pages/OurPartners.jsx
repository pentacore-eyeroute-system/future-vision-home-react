function OurPartners() {
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
              names={[
                'Kanthari Foundation Switzerland',
                'Stichting kanthari',
                'Philippine Blind Union (PBU)',
                'Eusebio C. Santos Elementary School (ECSES)',
                'Department of Education (DepEd) Bureau of Education Assessment (BEA)',
                'Butil ng Pag-asa',
                'Persons with Different Abilities (PWDA) Bambang',
              ]}
            />

            <PartnersCategory
              title="INDIVIDUALS"
              names={[
                'Cristy Villanueva',
                'Imee Licas Chulipa',
                'Sofia Villanueva',
                'Junver Arcayna',
                'Richt Arcayna (Ms. Jessa, Ms. Julie, Ms. Alyssa-Birthday Fund Raiser)',
                'Gigi Tibi',
                'Kristine Teves',
                'Runnesa Soriao',
                'Paola Jane Razon',
                'John Mark Limel Papag',
                'Seniorita Edna D. Lhuillier',
                'Catherine B. Jones',
                'Limuel H. Vilela',
                'Wil Sabado',
                'Jing/Grace Montoya',
                'Andrea',
                'Judith C. Abando',
                'Nancy D. Medina',
              ]}
            />

            <PartnersCategory
              title="PARENTS/GUARDIANS OF VISIONISTAS"
              names={[
                'Rowena Pindug',
                'Mirasol Trinidad',
                '& Mrs Michael Olaso',
                'Malou Bueno',
                'Tita Ivy Sinones',
                'Arsenia C. Sinones',
                'Danica B. Par',
                'Tita Josephine L. Malan',
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
