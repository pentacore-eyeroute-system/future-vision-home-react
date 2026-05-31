function Donate() {
  return (
    <>
      <section className="page-header">
        <div className="container">
          <h1 className="page-title">Future Vision Sighted-Blind INC</h1>
          <p className="page-subtitle">Be with us as we empower lives and create lasting impact!</p>
        </div>
      </section>

      <section className="donate">
        <div className="container">
          <div className="section-header">
            <p className="section-subtitle">
              To ensure the continuous operation of our home, we require financial assistance to cover
              essential expenses at the Home and fund projects advancing our mission. Your contribution,
              big or small, makes a difference.
            </p>
          </div>

          <div className="donate-content">
            <div className="donate-section">
              <h3 className="donate-section-title">Online Transactions</h3>
              <div className="donate-banks-grid donate-online-grid">
                <OnlineCard name="GCash" account="0942 376 9646" />
                <OnlineCard name="PayMaya" account="0936 925 3124" />
                <OnlineCard name="PayPal" account="0942 376 9646" />
              </div>
            </div>

            <div className="donate-section">
              <h3 className="donate-section-title">Bank Transfer</h3>
              <div className="donate-banks-grid">
                <BankCard
                  bank="Metrobank"
                  details={[
                    ['Branch', 'Taguig Puregold Branch'],
                    ['Account Name', 'FUTURE VISION SIGHTED-BLIND INC'],
                    ['Account Number', '381-3-38158824-7'],
                    ['SWIFT/BIC', 'MBTCPHMM'],
                    [
                      'Bank Address',
                      'Metrobank Taguig Commercial Units 7 – 10 Puregold Taguig Gen. A. Luna corner Col. P. Cruz St., Tuktukan, Taguig City',
                    ],
                    ['Bank Phone', '+632-6435023'],
                  ]}
                />
                <BankCard
                  bank="BDO (Banco De Oro)"
                  details={[
                    ['Branch', 'Levi Mariano Branch'],
                    ['Account Name', 'Lorena J. Acula'],
                    ['Account Number', '008070019536'],
                    ['SWIFT/BIC', 'BNORPHMN'],
                    [
                      'Bank Address',
                      'BDO 160 Levi Mariano Avenue Barangay Usuzan, Taguig City 1637 Philippines',
                    ],
                    ['Bank Phone', '+632-6407862'],
                  ]}
                />
              </div>
            </div>

            <div className="donate-thank-you">
              <p className="donate-thank-you-text">
                Again, thank you for being with us and for being our partner in creating vision, thus
                impact change in the lives of our blind brothers and Sisters. Requesting you all to please
                share this newsletter to your circle of friends and perhaps to companies whose mission is to
                help support our cause.
              </p>
              <p className="donate-thank-you-signature">GOD BLESS US ALL!</p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

function OnlineCard({ name, account }) {
  return (
    <div className="donate-bank">
      <h4 className="donate-bank-name">{name}</h4>
      <div className="donate-bank-details">
        <p>
          <strong>Account Number:</strong> {account}
        </p>
      </div>
    </div>
  )
}

function BankCard({ bank, details }) {
  return (
    <div className="donate-bank">
      <h4 className="donate-bank-name">{bank}</h4>
      <div className="donate-bank-details">
        {details.map(([label, value]) => (
          <p key={label}>
            <strong>{label}:</strong> {value}
          </p>
        ))}
      </div>
    </div>
  )
}

export default Donate
