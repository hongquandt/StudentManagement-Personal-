using System;
using System.Collections.Generic;

namespace StudentManagement.Models;

public partial class StudentParent
{
    public int Id { get; set; }

    public int StudentId { get; set; }

    public int ParentId { get; set; }

    public string? Relationship { get; set; }

    public virtual Parent Parent { get; set; } = null!;

    public virtual Student Student { get; set; } = null!;
}
