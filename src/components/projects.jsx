import React, { Component } from 'react';
import { toast } from  "react-toastify";
import { getProjects } from "../services/projectServices";

class Projects extends Component {
    state = { projects: [] }
    
    async componentDidMount() {
        const { data } = await getProjects();
        this.setState(data);
    }
    
    handleDelete = async project => {
        const originalProjects = this.state.projects;
        const projects = originalProjects.filter(p => p.id !== projet.id);
        this.setState({ projects });

        try {
            await deleteProject(project.id);
        } catch (ex) {
            if (ex.response && ex.response.status === 404)
                toast.error('This projet has already been deleted.');
            this.setState({ originalProjects });
        }
    };

    render() { 
        return (  );
    }
}
 
export default Projects;