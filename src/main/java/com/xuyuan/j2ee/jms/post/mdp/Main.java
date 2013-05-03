package com.xuyuan.j2ee.jms.post.mdp;

import org.apache.xbean.spring.context.ClassPathXmlApplicationContext;
import org.springframework.context.ApplicationContext;

import com.xuyuan.j2ee.jms.post.BackOffice;
import com.xuyuan.j2ee.jms.post.FrontDesk;
import com.xuyuan.j2ee.jms.post.Mail;

// 首先启动ActiveMQ，然后运行该类
public class Main {

	public static void main(String[] args) {
		//ApplicationContext context = new ClassPathXmlApplicationContext("spring/19/jms_mdp.xml"); 
		//ApplicationContext context = new ClassPathXmlApplicationContext("spring/19/jms_mdp_pojo.xml"); 
		//ApplicationContext context = new ClassPathXmlApplicationContext("spring/19/jms_mdp_pojo_convert.xml"); 
		ApplicationContext context = new ClassPathXmlApplicationContext("spring/19/jms_mdp_schema.xml"); 
 
        FrontDesk frontDesk = (FrontDesk) context.getBean("frontDesk"); 
        frontDesk.sendMail(new Mail("1234", "US", 1.5));
        
        BackOffice backOffice = (BackOffice) context.getBean("backOffice"); 
        Mail mail = backOffice.receiveMail(); 
        //由监听器打印消息，这里不打印了。
        //System.out.println("Mail #" + mail.getMailId() + " received"); 
	}
}