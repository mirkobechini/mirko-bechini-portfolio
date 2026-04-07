import certificationData from "../data/certificationData";

export default function CertificationPage() {
    return (
        <section className="certification-page">
            <h1>Certifications</h1>
            <p>This is the certifications page.</p>
            <div className="certification-list">

                {certificationData.map(cert => (
                    <div key={cert.id} className="certification-card">
                        <h2>{cert.title}</h2>
                        <p>{cert.description}</p>
                        <p>Ente: {cert.ente}</p>
                        <a href={cert.sito}>Sito</a>
                        <div className="skills">
                            {cert.skills.map(skill => (
                                <span key={skill}>{skill} </span>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}