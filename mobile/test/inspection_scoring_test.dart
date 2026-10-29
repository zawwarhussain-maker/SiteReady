import 'package:flutter_test/flutter_test.dart';
import 'package:siteready_gcc/models/inspection.dart';
import 'package:siteready_gcc/models/inspection_item.dart';

void main() {
  group('Inspection Checkpoint Scoring & Pass/Fail Calculations', () {
    test('All passed checkpoints produce 100% score and isPassing = true', () {
      final items = [
        InspectionItem(
          id: '1',
          inspectionId: 'i1',
          category: 'PPE',
          itemText: 'Hard hats',
          result: CheckpointResult.pass,
        ),
        InspectionItem(
          id: '2',
          inspectionId: 'i1',
          category: 'Scaffolding',
          itemText: 'Green tag',
          result: CheckpointResult.pass,
        ),
        InspectionItem(
          id: '3',
          inspectionId: 'i1',
          category: 'Electrical',
          itemText: 'RCD Breakers',
          result: CheckpointResult.na,
        ),
      ];

      final insp = Inspection(
        id: 'i1',
        companyId: 'c1',
        siteId: 's1',
        title: 'Weekly Audit',
        scheduledDate: DateTime.now(),
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
        items: items,
      );

      expect(insp.passCount, 2);
      expect(insp.failCount, 0);
      expect(insp.naCount, 1);
      expect(insp.evaluatedCount, 2);
      expect(insp.scorePercentage, 100.0);
      expect(insp.isPassing, isTrue);
    });

    test('Single failed checkpoint triggers isPassing = false', () {
      final items = [
        InspectionItem(
          id: '1',
          inspectionId: 'i2',
          category: 'Lifting',
          itemText: 'Slings',
          result: CheckpointResult.fail,
        ),
        InspectionItem(
          id: '2',
          inspectionId: 'i2',
          category: 'PPE',
          itemText: 'Vests',
          result: CheckpointResult.pass,
        ),
      ];

      final insp = Inspection(
        id: 'i2',
        companyId: 'c1',
        siteId: 's1',
        title: 'Rigging Audit',
        scheduledDate: DateTime.now(),
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
        items: items,
      );

      expect(insp.passCount, 1);
      expect(insp.failCount, 1);
      expect(insp.scorePercentage, 50.0);
      expect(insp.isPassing, isFalse);
    });
  });
}
