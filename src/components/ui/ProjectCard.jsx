import { Link } from "react-router-dom";

export default function ProjectCard({project}) {
    return (
        <section className="project-card">
            <h2>{project.title}</h2>
            <Link to={project.demo}>
                <img src={project.preview} alt={`${project.title} preview`} />
            </Link>
            <p>{project.description}</p>
            <p>Customer: {project.customer}</p>
            <div> {project.technologies.map(tech => 
                <span key={tech}>{tech} </span>
            )}
            </div>
            <a href={project.repo}>View Details</a>
        </section>
    );
}