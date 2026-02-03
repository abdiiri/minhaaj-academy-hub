-- Add grade_scale column to classes table for custom grading
ALTER TABLE public.classes
ADD COLUMN grade_scale jsonb DEFAULT '[
  {"minPercentage": 90, "grade": "A+", "description": "Excellent"},
  {"minPercentage": 85, "grade": "A", "description": "Very Good"},
  {"minPercentage": 80, "grade": "A-", "description": "Very Good"},
  {"minPercentage": 75, "grade": "B+", "description": "Good"},
  {"minPercentage": 70, "grade": "B", "description": "Good"},
  {"minPercentage": 65, "grade": "B-", "description": "Above Average"},
  {"minPercentage": 60, "grade": "C+", "description": "Average"},
  {"minPercentage": 55, "grade": "C", "description": "Average"},
  {"minPercentage": 50, "grade": "C-", "description": "Below Average"},
  {"minPercentage": 45, "grade": "D+", "description": "Pass"},
  {"minPercentage": 40, "grade": "D", "description": "Pass"},
  {"minPercentage": 0, "grade": "F", "description": "Fail"}
]'::jsonb;