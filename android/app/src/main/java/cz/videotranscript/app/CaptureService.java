package cz.videotranscript.app;
import android.app.*;import android.content.*;import android.os.*;import android.media.*;import android.media.projection.*;import java.io.*;
public class CaptureService extends Service {
 volatile boolean running; MediaProjection projection; AudioRecord recorder; Thread worker;
 public IBinder onBind(Intent i){return null;}
 public int onStartCommand(Intent i,int flags,int id){if(i==null)return START_NOT_STICKY;if("STOP".equals(i.getAction())){running=false;stopSelf();return START_NOT_STICKY;}if(running)return START_NOT_STICKY;
 NotificationManager nm=getSystemService(NotificationManager.class);nm.createNotificationChannel(new NotificationChannel("capture","Záznam zvuku",NotificationManager.IMPORTANCE_LOW));
 PendingIntent stop=PendingIntent.getService(this,1,new Intent(this,CaptureService.class).setAction("STOP"),PendingIntent.FLAG_IMMUTABLE);
 startForeground(1,new Notification.Builder(this,"capture").setSmallIcon(android.R.drawable.ic_btn_speak_now).setContentTitle("VideoTranscript – záznam zvuku").addAction(new Notification.Action.Builder(null,"Ukončit",stop).build()).build());
 try{projection=getSystemService(MediaProjectionManager.class).getMediaProjection(i.getIntExtra("code",0),i.getParcelableExtra("data"));projection.registerCallback(new MediaProjection.Callback(){public void onStop(){running=false;stopSelf();}},new Handler(Looper.getMainLooper()));
 AudioPlaybackCaptureConfiguration c=new AudioPlaybackCaptureConfiguration.Builder(projection).addMatchingUsage(AudioAttributes.USAGE_MEDIA).build();
 AudioFormat f=new AudioFormat.Builder().setSampleRate(16000).setEncoding(AudioFormat.ENCODING_PCM_16BIT).setChannelMask(AudioFormat.CHANNEL_IN_MONO).build();
 int size=Math.max(4096,AudioRecord.getMinBufferSize(16000,AudioFormat.CHANNEL_IN_MONO,AudioFormat.ENCODING_PCM_16BIT)*2);
 recorder=new AudioRecord.Builder().setAudioFormat(f).setBufferSizeInBytes(size).setAudioPlaybackCaptureConfig(c).build();recorder.startRecording();running=true;worker=new Thread(()->{try(FileOutputStream out=new FileOutputStream(new File(getFilesDir(),"capture.pcm"))){byte[] buf=new byte[size];long total=0;while(running&&total<28800000){int n=recorder.read(buf,0,buf.length);if(n<0)break;if(n>0){out.write(buf,0,n);total+=n;}}}catch(Exception e){android.util.Log.e("Capture","Recording failed",e);}finally{running=false;stopSelf();}});worker.start();
 }catch(Exception e){android.util.Log.e("Capture","Cannot start",e);stopSelf();}return START_NOT_STICKY;}
 public void onDestroy(){running=false;if(recorder!=null){try{recorder.stop();}catch(Exception ignored){}try{if(worker!=null)worker.join(1000);}catch(InterruptedException ignored){}recorder.release();}if(projection!=null)projection.stop();super.onDestroy();}
}