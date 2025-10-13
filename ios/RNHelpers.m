#import "RNHelpersModule.h"
#import <React/RCTBridgeModule.h>

@implementation RNHelpersModule

RCT_EXPORT_MODULE(RNHelpersModule);

RCT_EXPORT_METHOD(excludeFromBackup:(NSString *)filePath
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
  @try {
    NSString *documentsPath = [NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES) firstObject];
    NSString *filePathFull = [documentsPath stringByAppendingPathComponent:filePath];
    NSURL *fileURL = [NSURL fileURLWithPath:filePathFull];

    NSError *error = nil;
    BOOL success = [fileURL setResourceValue:@YES
                                      forKey:NSURLIsExcludedFromBackupKey
                                       error:&error];

    if (success) {
      resolve(@YES);
    } else {
      reject(@"exclude_error", @"Failed to exclude file from backup", error);
    }
  } @catch (NSException *exception) {
    reject(@"exclude_error", @"Exception occurred while excluding file", nil);
  }
}

@end

