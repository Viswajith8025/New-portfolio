import type { Project } from '../../data/site'

export function ProjectVideoCard({ project }: { project: Project }) {
  return (
    <div className="project-video-fallback">
      <img src={project.poster} alt="" loading="lazy" />
    </div>
  )
}
