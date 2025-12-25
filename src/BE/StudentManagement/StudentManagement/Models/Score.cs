using System;
using System.Collections.Generic;

namespace StudentManagement.Models;

public partial class Score
{
    public int ScoreId { get; set; }

    public int StudentId { get; set; }

    public int SubjectId { get; set; }

    public int SemesterId { get; set; }

    public double? OralScore { get; set; }

    public double? QuizScore { get; set; }

    public double? MidtermScore { get; set; }

    public double? FinalScore { get; set; }

    public decimal? AverageScore { get; set; }

    public virtual Semester Semester { get; set; } = null!;

    public virtual Student Student { get; set; } = null!;

    public virtual Subject Subject { get; set; } = null!;
}
