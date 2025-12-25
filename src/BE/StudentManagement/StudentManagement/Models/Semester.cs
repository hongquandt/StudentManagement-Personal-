using System;
using System.Collections.Generic;

namespace StudentManagement.Models;

public partial class Semester
{
    public int SemesterId { get; set; }

    public string SemesterName { get; set; } = null!;

    public int AcademicYearId { get; set; }

    public DateOnly? StartDate { get; set; }

    public DateOnly? EndDate { get; set; }

    public virtual AcademicYear AcademicYear { get; set; } = null!;

    public virtual ICollection<Conduct> Conducts { get; set; } = new List<Conduct>();

    public virtual ICollection<LearningAnalytic> LearningAnalytics { get; set; } = new List<LearningAnalytic>();

    public virtual ICollection<Score> Scores { get; set; } = new List<Score>();

    public virtual ICollection<TeachingAssignment> TeachingAssignments { get; set; } = new List<TeachingAssignment>();

    public virtual ICollection<Timetable> Timetables { get; set; } = new List<Timetable>();
}
