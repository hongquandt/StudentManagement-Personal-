using System;
using System.Collections.Generic;

namespace StudentManagement.Models;

public partial class AcademicYear
{
    public int AcademicYearId { get; set; }

    public string YearName { get; set; } = null!;

    public bool? IsActive { get; set; }

    public virtual ICollection<Class> Classes { get; set; } = new List<Class>();

    public virtual ICollection<Semester> Semesters { get; set; } = new List<Semester>();
}
