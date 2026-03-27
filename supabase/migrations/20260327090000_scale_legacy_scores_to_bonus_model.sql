-- Rescale pre-gamification scores to the new scoring model.
--
-- Legacy rows stored `score` as raw correct-answer count only.
-- The current score model awards:
--   - 100 points per correct answer
--   - 35 bonus points for a first-try answer
--   - 15 bonus points for a second-try answer
--   - 5 bonus points for a third-try answer
--   - capped streak bonuses
--   - 60 points for a no-skip finish
--   - 120 points for a flawless finish
--
-- Base points and finish bonuses can be inferred exactly from legacy rows.
-- Per-answer attempt quality cannot, so this migration estimates those bonuses
-- from `errors`, `best_streak`, and the skipped-region count.
--
-- The cutover timestamp matches commit ee97d12
-- ("Implement gamification and replayability foundations"), after which scores
-- were already stored on the new point scale.
WITH legacy_rows AS (
  SELECT
    id,
    score AS legacy_correct_answers,
    total_regions,
    errors,
    GREATEST(total_regions - score, 0) AS legacy_skipped_count,
    GREATEST(errors - GREATEST(total_regions - score, 0), 0) AS legacy_answer_errors,
    GREATEST(best_streak, 0) AS legacy_best_streak
  FROM scores
  WHERE created_at < TIMESTAMPTZ '2026-03-24 22:30:26+00'
    AND score <= total_regions
),
estimated_attempt_mix AS (
  SELECT
    id,
    legacy_correct_answers,
    legacy_skipped_count,
    errors,
    legacy_best_streak,
    LEAST(legacy_correct_answers, legacy_answer_errors) AS estimated_non_first_try_answers,
    LEAST(
      LEAST(legacy_correct_answers, legacy_answer_errors),
      GREATEST(legacy_answer_errors - LEAST(legacy_correct_answers, legacy_answer_errors), 0)
    ) AS estimated_third_try_answers
  FROM legacy_rows
),
estimated_answer_buckets AS (
  SELECT
    id,
    legacy_correct_answers,
    legacy_skipped_count,
    errors,
    GREATEST(legacy_correct_answers - estimated_non_first_try_answers, 0) AS estimated_first_try_answers,
    GREATEST(estimated_non_first_try_answers - estimated_third_try_answers, 0) AS estimated_second_try_answers,
    estimated_third_try_answers,
    LEAST(
      legacy_best_streak,
      GREATEST(legacy_correct_answers - estimated_non_first_try_answers, 0)
    ) AS capped_best_streak
  FROM estimated_attempt_mix
),
estimated_streak_scores AS (
  SELECT
    id,
    legacy_correct_answers,
    legacy_skipped_count,
    errors,
    estimated_first_try_answers,
    estimated_second_try_answers,
    estimated_third_try_answers,
    LEAST(
      CASE
        WHEN estimated_first_try_answers <= 1 THEN 0
        WHEN estimated_first_try_answers <= 6
          THEN ((estimated_first_try_answers - 1) * estimated_first_try_answers * 5) / 2
        ELSE 75 + ((estimated_first_try_answers - 6) * 25)
      END,
      CASE
        WHEN capped_best_streak <= 1 THEN 0
        WHEN capped_best_streak <= 6
          THEN ((capped_best_streak - 1) * capped_best_streak * 5) / 2
        ELSE 75 + ((capped_best_streak - 6) * 25)
      END
      + (GREATEST(estimated_first_try_answers - capped_best_streak, 0) * 3)
    ) AS estimated_streak_bonus
  FROM estimated_answer_buckets
),
scaled_legacy_scores AS (
  SELECT
    id,
    (
      legacy_correct_answers * 100
      + estimated_first_try_answers * 35
      + estimated_second_try_answers * 15
      + estimated_third_try_answers * 5
      + estimated_streak_bonus
      + CASE WHEN legacy_skipped_count = 0 THEN 60 ELSE 0 END
      + CASE WHEN legacy_skipped_count = 0 AND errors = 0 THEN 120 ELSE 0 END
    )::INTEGER AS scaled_score
  FROM estimated_streak_scores
)
UPDATE scores
SET score = scaled_legacy_scores.scaled_score
FROM scaled_legacy_scores
WHERE scores.id = scaled_legacy_scores.id;
