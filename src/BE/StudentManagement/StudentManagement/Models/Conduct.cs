using System;
using System.Collections.Generic;

namespace StudentManagement.Models;

public partial class Conduct
{
    public int ConductId { get; set; }

    public int StudentId { get; set; }

    public int SemesterId { get; set; }

    public string? ConductLevel { get; set; }

    public string? Comment { get; set; }

    public virtual Semester Semester { get; set; } = null!;

    public virtual Student Student { get; set; } = null!;
}
