using System;
using System.Collections.Generic;

namespace StudentManagement.Models;

public partial class Subject
{
    public int SubjectId { get; set; }

    public string SubjectName { get; set; } = null!;

    public int? Credit { get; set; }

    public virtual ICollection<Score> Scores { get; set; } = new List<Score>();

    public virtual ICollection<TeachingAssignment> TeachingAssignments { get; set; } = new List<TeachingAssignment>();

    public virtual ICollection<Timetable> Timetables { get; set; } = new List<Timetable>();
}
