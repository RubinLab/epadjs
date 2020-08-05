import React from "react";

class TemplateColumn extends React.Component {
  populateTemplateRows = () => {
    let rows = [];

    this.props.templates.forEach((template) => {
      rows.push(
        <tr key={template.id} className="edit-userRole__table--row">
          <td>
            <input
              type="checkbox"
              value={template.id}
              name={template.id}
              onChange={() => {
                this.props.onChange(template.id);
              }}
            />
          </td>
          <td>{template.templateName}</td>
        </tr>
      );
    });
    return rows;
  };
  render() {
    return (
      <div className="column">
        <h2>Templates</h2>

        <table>
          <tbody>{this.populateTemplateRows()}</tbody>
        </table>
      </div>
    );
  }
}

export default TemplateColumn;
