import React from "react";
class ProjectColumn extends React.Component {
  populateProjectRows = () => {
    let rows = [];

    this.props.projects.forEach((project) => {
      //  console.log("template modal ---->>>>>> ", template);
      rows.push(
        <tr key={project.id} className="edit-userRole__table--row">
          <td>
            <input
              type="checkbox"
              value={project.id}
              name={project.id}
              onChange={() => {
                this.props.onChange(project.id);
              }}
            />
          </td>
          <td>{project.name}</td>
        </tr>
      );
    });
    return rows;
  };
  render() {
    return (
      <div className="column">
        <h2>Projects</h2>
        <table>
          <tbody>{this.populateProjectRows()}</tbody>
        </table>
      </div>
    );
  }
}

export default ProjectColumn;
