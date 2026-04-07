import ProjectCard from "../components/ui/ProjectCard";
import projectData from "../data/projectData";

export default function ProjectsPage() {

    return (
        <>
            <h1>Progetti</h1>
            <div className="projects-intro">
                <p>Lorem ipsum dolor sit, amet consectetur adipisicing elit. Molestiae veniam debitis consequuntur eius unde iure adipisci laudantium sed harum neque? Optio voluptatem magnam praesentium, enim cupiditate maxime libero earum quasi.</p>
            </div>
            <div className="projects-list">
            {
                projectData.map((project) => (
                    <ProjectCard key={project.id} project={project} />
                ))
            }
            </div>
            <button className="load-more">Carica altri progetti</button>
        </>
    )
}